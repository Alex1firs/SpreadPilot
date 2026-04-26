import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { spotMarketPrices, spotOpportunities, spotScanRuns } from '../db/schema';
import { eq } from 'drizzle-orm';

import { BinanceSpotProvider } from '../scanner/spot/providers/binance';
import { BybitSpotProvider } from '../scanner/spot/providers/bybit';
import { KuCoinSpotProvider } from '../scanner/spot/providers/kucoin';
import { OKXSpotProvider } from '../scanner/spot/providers/okx';
import { calculateSpotOpportunities } from '../scanner/spot/calculate-opportunities';
import { MarketPrice } from '../scanner/spot/types';
import { SPOT_SYMBOLS, CONFIRMATION_WAIT_SECONDS } from '../scanner/spot/config';


async function fetchAllPrices(providers: any[]): Promise<MarketPrice[]> {
  const results = await Promise.all(providers.map((p) => p.fetchPrices()));
  return results.flat();
}

function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function runSpotScanner() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const providers = [
    new BinanceSpotProvider(),
    new BybitSpotProvider(),
    new KuCoinSpotProvider(),
    new OKXSpotProvider(),
  ];

  console.log('🚀 Starting Spot Arbitrage Scanner...');
  console.log(`📡 Monitoring ${SPOT_SYMBOLS.join(', ')} on ${providers.map((p) => p.name).join(', ')}`);

  // Create scan run record
  const [scanRun] = await db.insert(spotScanRuns).values({
    status: 'pending',
    startedAt: new Date(),
  }).returning();

  try {
    // ─── PHASE 1: Initial Price Fetch ───────────────────────────────────────
    console.log('\n📥 Phase 1: Fetching live prices...');
    const firstFetch = await fetchAllPrices(providers);

    console.log(`\n📊 Raw normalized prices (${firstFetch.length} records):`);
    for (const p of firstFetch) {
      console.log(`   [${p.exchange}] ${p.symbol} | ask: ${p.askPrice} (qty: ${p.askQty}) | bid: ${p.bidPrice} (qty: ${p.bidQty}) | source: ${p.source}`);
    }

    // Save raw prices to database
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

    // ─── PHASE 2: Find Candidate Opportunities ───────────────────────────────
    console.log('\n🔍 Phase 2: Calculating candidate opportunities...');
    const candidates = calculateSpotOpportunities(firstFetch);

    if (candidates.length === 0) {
      console.log('ℹ️  No profitable spot arbitrage opportunities found in first pass.');
    } else {
      console.log(`✨ Found ${candidates.length} candidate(s). Running second confirmation check in ${CONFIRMATION_WAIT_SECONDS}s...`);
    }

    // ─── PHASE 3: Second Confirmation Check ─────────────────────────────────
    const confirmedOpps = [];

    if (candidates.length > 0) {
      await sleep(CONFIRMATION_WAIT_SECONDS);
      console.log('\n🔄 Phase 3: Second confirmation fetch...');
      const secondFetch = await fetchAllPrices(providers);

      console.log(`📊 Confirmation prices (${secondFetch.length} records):`);
      for (const p of secondFetch) {
        console.log(`   [${p.exchange}] ${p.symbol} | ask: ${p.askPrice} | bid: ${p.bidPrice}`);
      }

      const confirmedAt = new Date();
      const reconfirmed = calculateSpotOpportunities(secondFetch);

      // Only keep opportunities that survived BOTH passes
      for (const candidate of candidates) {
        const match = reconfirmed.find(
          (r) =>
            r.symbol === candidate.symbol &&
            r.buyExchange === candidate.buyExchange &&
            r.sellExchange === candidate.sellExchange
        );

        if (match) {
          // Use confirmation-pass prices (more conservative)
          confirmedOpps.push({ ...match, confirmedAt });
          console.log(`✅ CONFIRMED: ${match.symbol} Buy ${match.buyExchange} → Sell ${match.sellExchange} | Net $${match.netProfitUsdt}`);
        } else {
          console.log(`❌ REJECTED (did not survive confirmation): ${candidate.symbol} ${candidate.buyExchange} → ${candidate.sellExchange}`);
        }
      }
    }

    // ─── PHASE 4: Deactivate old spot opportunities ──────────────────────────
    await db.update(spotOpportunities)
      .set({ status: 'expired' })
      .where(eq(spotOpportunities.status, 'active'));

    // ─── PHASE 5: Save confirmed opportunities ───────────────────────────────
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
      console.log(`\n💾 Saved ${confirmedOpps.length} confirmed opportunit${confirmedOpps.length === 1 ? 'y' : 'ies'} to database.`);
    } else {
      console.log('\nℹ️  No real confirmed opportunities — nothing saved. No fake data generated.');
    }

    // ─── PHASE 6: Update scan run ────────────────────────────────────────────
    await db.update(spotScanRuns).set({
      status: 'completed',
      completedAt: new Date(),
      exchangesScanned: providers.length.toString(),
      symbolsScanned: SPOT_SYMBOLS.length.toString(),
      opportunitiesFound: confirmedOpps.length.toString(),
    }).where(eq(spotScanRuns.id, scanRun.id));

    console.log('\n✅ Spot scan complete.');
    return {
      status: 'completed',
      exchangesScanned: providers.length,
      symbolsScanned: SPOT_SYMBOLS.length,
      pricesFetched: firstFetch.length,
      opportunitiesFound: confirmedOpps.length,
      opportunities: confirmedOpps,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await db.update(spotScanRuns).set({
      status: 'failed',
      errorMessage,
    }).where(eq(spotScanRuns.id, scanRun.id));

    console.error('❌ Spot Scanner Error:', errorMessage);
    throw err;
  }
}

// CLI execution
if (
  process.argv[1] &&
  (import.meta.url.endsWith(process.argv[1]) || process.argv[1].endsWith('scan-spot-prices.ts'))
) {
  runSpotScanner().catch((err) => {
    console.error('❌ Fatal:', err);
    process.exit(1);
  });
}
