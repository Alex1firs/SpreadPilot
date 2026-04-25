import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { opportunities, exchangePrices, scanRuns, opportunitySnapshots } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

import { BinanceProvider } from '../scanner/providers/binance';
import { OkxProvider } from '../scanner/providers/okx';
import { BybitProvider } from '../scanner/providers/bybit';
import { KucoinProvider } from '../scanner/providers/kucoin';
import { calculateOpportunities } from '../scanner/calculate-opportunities';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export async function runScanner() {
  console.log('🚀 Starting P2P Price Scanner...');

  // 0. Safety: Check for active/stale "pending" scans
  // If a scan was started in the last 2 minutes and is still pending, skip.
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const existingPending = await db.select()
    .from(scanRuns)
    .where(and(eq(scanRuns.status, 'pending'), gt(scanRuns.startedAt, twoMinutesAgo)))
    .limit(1);

  if (existingPending.length > 0) {
    console.log('⏳ A scan is already in progress. Skipping...');
    return { status: 'skipped', reason: 'already_running' };
  }

  // Initialize Scan Run
  const [scanRun] = await db.insert(scanRuns).values({
    status: 'pending',
    startedAt: new Date(),
  }).returning();

  try {
    const providers = [
      new BinanceProvider(),
      new OkxProvider(),
      new BybitProvider(),
      new KucoinProvider()
    ];

    // 1. Fetch Prices
    const prices = await Promise.all(providers.map(p => p.fetchPrices()));
    console.log(`📡 Fetched prices from ${prices.length} exchanges.`);

    // 2. Save Prices to Database
    for (const price of prices) {
      await db.insert(exchangePrices).values({
        exchange: price.exchange,
        currency: price.currency,
        buyPrice: price.buyPrice.toString(),
        sellPrice: price.sellPrice.toString(),
        lastUpdated: price.lastUpdated
      });
    }

    // 3. Calculate Opportunities
    const newOpps = calculateOpportunities(prices);
    console.log(`📈 Calculated ${newOpps.length} profitable opportunities.`);

    // 4. Deactivate old opportunities
    await db.update(opportunities)
      .set({ isActive: false })
      .where(eq(opportunities.isActive, true));

    // 5. Save New Opportunities & Snapshots
    if (newOpps.length > 0) {
      for (const opp of newOpps) {
        await db.insert(opportunities).values({
          buyExchange: opp.buyExchange,
          sellExchange: opp.sellExchange,
          buyPrice: opp.buyPrice.toString(),
          sellPrice: opp.sellPrice.toString(),
          spread: opp.spread.toString(),
          grossProfit: opp.grossProfit.toString(),
          estimatedFees: opp.estimatedFees.toString(),
          slippageBuffer: opp.slippageBuffer.toString(),
          netProfit: opp.netProfit.toString(),
          requiredCapitalNgn: opp.requiredCapitalNgn.toString(),
          confidenceScore: opp.confidenceScore.toString(),
          volumeUsdt: opp.volumeUsdt.toString(),
          riskLevel: opp.riskLevel,
          isActive: true
        });

        await db.insert(opportunitySnapshots).values({
          scanRunId: scanRun.id,
          buyExchange: opp.buyExchange,
          sellExchange: opp.sellExchange,
          buyPrice: opp.buyPrice.toString(),
          sellPrice: opp.sellPrice.toString(),
          spread: opp.spread.toString(),
          grossProfit: opp.grossProfit.toString(),
          estimatedFees: opp.estimatedFees.toString(),
          slippageBuffer: opp.slippageBuffer.toString(),
          netProfit: opp.netProfit.toString(),
          requiredCapitalNgn: opp.requiredCapitalNgn.toString(),
          confidenceScore: opp.confidenceScore.toString(),
          riskLevel: opp.riskLevel,
          paymentMethod: 'Bank Transfer',
        });
      }
    }

    // 6. Complete Scan Run
    const bestSpread = newOpps.length > 0 ? Math.max(...newOpps.map(o => o.spread)) : 0;
    const bestNetProfit = newOpps.length > 0 ? Math.max(...newOpps.map(o => o.netProfit)) : 0;

    await db.update(scanRuns)
      .set({
        status: 'completed',
        completedAt: new Date(),
        exchangesScanned: providers.length.toString(),
        opportunitiesFound: newOpps.length.toString(),
        bestSpread: bestSpread.toString(),
        bestNetProfit: bestNetProfit.toString(),
      })
      .where(eq(scanRuns.id, scanRun.id));

    console.log('✅ Scan content updated in database.');
    return { status: 'completed', opportunities: newOpps.length };
  } catch (err) {
    await db.update(scanRuns)
      .set({ status: 'failed' })
      .where(eq(scanRuns.id, scanRun.id));
    throw err;
  }
}

// Allow CLI execution
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1].endsWith('scan-prices.ts')) {
  runScanner().catch(err => {
    console.error('❌ Scanner Error:', err);
    process.exit(1);
  });
}
