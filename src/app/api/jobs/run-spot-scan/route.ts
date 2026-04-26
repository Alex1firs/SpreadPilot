import { NextResponse } from 'next/server';

// Inline the scanner logic so it works in the Next.js serverless runtime
// (no CLI process.argv dependency)
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { spotMarketPrices, spotOpportunities, spotScanRuns, spotProviderHealth, spotAlertLogs, alertSettings, subscriptions } from '@/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendTelegramAlert } from '@/lib/telegram';

import { BinanceSpotProvider } from '@/scanner/spot/providers/binance';
import { BybitSpotProvider } from '@/scanner/spot/providers/bybit';
import { KuCoinSpotProvider } from '@/scanner/spot/providers/kucoin';
import { OKXSpotProvider } from '@/scanner/spot/providers/okx';
import { GateIoSpotProvider } from '@/scanner/spot/providers/gate';
import { MEXCSpotProvider } from '@/scanner/spot/providers/mexc';
import { calculateSpotOpportunities } from '@/scanner/spot/calculate-opportunities';
import { MarketPrice, SpotOpportunity } from '@/scanner/spot/types';
import { SPOT_SYMBOLS, CONFIRMATION_WAIT_SECONDS } from '@/scanner/spot/config';

// Max Vercel function duration – set to 60s (Pro plan supports up to 300s)
export const maxDuration = 60;

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const providers = [
    new BinanceSpotProvider(),
    new BybitSpotProvider(),
    new KuCoinSpotProvider(),
    new OKXSpotProvider(),
    new GateIoSpotProvider(),
    new MEXCSpotProvider(),
  ];

  const [scanRun] = await db.insert(spotScanRuns).values({
    status: 'pending',
    startedAt: new Date(),
  }).returning();

  try {
    // Phase 1: Fetch
    const providerResults = await Promise.all(
      providers.map(async (provider) => {
        const startTime = Date.now();
        const prices = await provider.fetchPrices();
        return {
          exchange: provider.name,
          prices,
          durationMs: Date.now() - startTime,
        };
      })
    );

    const firstFetch: MarketPrice[] = providerResults.flatMap((result) => result.prices);

    if (providerResults.length > 0) {
      await db.insert(spotProviderHealth).values(
        providerResults.map((result) => ({
          scanRunId: scanRun.id,
          exchange: result.exchange,
          status: result.prices.length === SPOT_SYMBOLS.length ? 'ok' : result.prices.length > 0 ? 'partial' : 'failed',
          pricesFetched: result.prices.length,
          durationMs: result.durationMs,
          errorMessage: null,
          checkedAt: new Date(),
        }))
      );
    }

    // Save raw prices for transparency and debugging
    if (firstFetch.length > 0) {
      await db.insert(spotMarketPrices).values(
        firstFetch.map((p) => ({
          exchange: p.exchange,
          symbol: p.symbol,
          bidPrice: p.bidPrice.toString(),
          bidQty: p.bidQty.toString(),
          askPrice: p.askPrice.toString(),
          askQty: p.askQty.toString(),
          timestamp: p.timestamp,
        }))
      );
    }

    // Phase 2: Find candidates
    const candidates = calculateSpotOpportunities(firstFetch);

    // Phase 3: Second confirmation
    const confirmedOpps = [];
    if (candidates.length > 0) {
      await new Promise((r) => setTimeout(r, CONFIRMATION_WAIT_SECONDS * 1000));
      const secondResults = await Promise.all(providers.map((p) => p.fetchPrices()));
      const secondFetch: MarketPrice[] = secondResults.flat();
      const reconfirmed = calculateSpotOpportunities(secondFetch);
      const confirmedAt = new Date();

      for (const candidate of candidates) {
        const match = reconfirmed.find(
          (r) =>
            r.symbol === candidate.symbol &&
            r.buyExchange === candidate.buyExchange &&
            r.sellExchange === candidate.sellExchange
        );
        if (match) {
          confirmedOpps.push({ ...match, confirmedAt });
        }
      }
    }

    // Phase 4: Deactivate old + save confirmed
    await db.update(spotOpportunities)
      .set({ status: 'expired' })
      .where(eq(spotOpportunities.status, 'active'));

    const insertedOpps = confirmedOpps.length > 0
      ? await db.insert(spotOpportunities).values(
        confirmedOpps.map((opp) => ({
          symbol: opp.symbol,
          buyExchange: opp.buyExchange,
          sellExchange: opp.sellExchange,
          buyPrice: opp.buyPrice.toString(),
          sellPrice: opp.sellPrice.toString(),
          tradeSizeUsdt: opp.tradeSizeUsdt.toString(),
          grossProfitUsdt: opp.grossProfitUsdt.toString(),
          tradingFeesUsdt: opp.tradingFeesUsdt.toString(),
          withdrawalFeeUsdt: opp.withdrawalFeeUsdt.toString(),
          netProfitUsdt: opp.netProfitUsdt.toString(),
          netProfitPercent: opp.netProfitPercent.toString(),
          liquidityUsdt: opp.liquidityUsdt.toString(),
          confidenceScore: opp.confidenceScore.toString(),
          status: 'active',
          confirmedAt: opp.confirmedAt,
        }))
      ).returning()
      : [];

    let alertsSent = 0;
    if (confirmedOpps.length > 0) {
      try {
        const proUsers = await db.select({
          telegramChatId: alertSettings.telegramChatId,
          userClerkId: alertSettings.userClerkId,
        })
          .from(alertSettings)
          .innerJoin(subscriptions, eq(alertSettings.userClerkId, subscriptions.userClerkId))
          .where(and(
            eq(alertSettings.alertsEnabled, true),
            isNotNull(alertSettings.telegramChatId),
            eq(subscriptions.status, 'active'),
          ));

        for (const user of proUsers) {
          if (!user.telegramChatId) continue;
          for (let index = 0; index < confirmedOpps.length; index += 1) {
            const opp = confirmedOpps[index] as SpotOpportunity;
            const insertedOpp = insertedOpps[index];
            const msg = [
              `🚀 <b>Spot Arbitrage Alert</b>`,
              ``,
              `<b>Pair:</b> ${opp.symbol}`,
              `<b>Route:</b> Buy ${opp.buyExchange} → Sell ${opp.sellExchange}`,
              ``,
              `<b>Buy Price:</b> $${opp.buyPrice.toFixed(4)} (${opp.buyExchange})`,
              `<b>Sell Price:</b> $${opp.sellPrice.toFixed(4)} (${opp.sellExchange})`,
              ``,
              `💰 <b>Net Profit: $${opp.netProfitUsdt.toFixed(2)} (${opp.netProfitPercent.toFixed(3)}%)</b>`,
              `📦 Trade Size: $${opp.tradeSizeUsdt} USDT`,
              `⚡ Fees: $${opp.tradingFeesUsdt.toFixed(2)}`,
              `🔒 Confidence: ${opp.confidenceScore}%`,
              ``,
              `⚠️ Always verify prices before executing. Spreads close fast.`,
            ].join('\n');

            const sent = await sendTelegramAlert(user.telegramChatId, msg).catch(() => false);
            if (sent !== false && insertedOpp?.id) {
              alertsSent += 1;
              await db.insert(spotAlertLogs).values({
                userClerkId: user.userClerkId,
                opportunityId: insertedOpp.id,
                channel: 'telegram',
                sentAt: new Date(),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.error('❌ [Spot Alerts] Failed to send alerts:', err instanceof Error ? err.message : err);
      }
    }

    await db.update(spotScanRuns).set({
      status: 'completed',
      completedAt: new Date(),
      exchangesScanned: providers.length,
      symbolsScanned: SPOT_SYMBOLS.length,
      pricesFetched: firstFetch.length,
      candidatesFound: candidates.length,
      opportunitiesFound: confirmedOpps.length,
      alertsSent,
    }).where(eq(spotScanRuns.id, scanRun.id));

    return NextResponse.json({
      success: true,
      pricesFetched: firstFetch.length,
      candidates: candidates.length,
      confirmed: confirmedOpps.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.update(spotScanRuns).set({
      status: 'failed',
      errorMessage: msg,
    }).where(eq(spotScanRuns.id, scanRun.id));

    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
