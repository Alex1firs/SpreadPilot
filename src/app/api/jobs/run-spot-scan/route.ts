import { NextResponse } from 'next/server';

// Inline the scanner logic so it works in the Next.js serverless runtime
// (no CLI process.argv dependency)
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { spotMarketPrices, spotOpportunities, spotScanRuns, alertSettings, subscriptions } from '@/db/schema';
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
    const firstResults = await Promise.all(providers.map((p) => p.fetchPrices()));
    const firstFetch: MarketPrice[] = firstResults.flat();

    // Save raw prices
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

    if (confirmedOpps.length > 0) {
      await db.insert(spotOpportunities).values(
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
      );
    }

    await db.update(spotScanRuns).set({
      status: 'completed',
      completedAt: new Date(),
      exchangesScanned: providers.length.toString(),
      symbolsScanned: SPOT_SYMBOLS.length.toString(),
      opportunitiesFound: confirmedOpps.length.toString(),
    }).where(eq(spotScanRuns.id, scanRun.id));

    // Phase 5: Send Telegram alerts to Pro/Premium users
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
          for (const opp of confirmedOpps as SpotOpportunity[]) {
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
            await sendTelegramAlert(user.telegramChatId, msg).catch(() => {});
          }
        }
      } catch {
        // Don't fail the scan if alerts fail
      }
    }

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
