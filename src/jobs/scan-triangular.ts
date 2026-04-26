import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { triangularOpportunities, alertSettings, subscriptions } from '../db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendTelegramAlert } from '@/lib/telegram';

import { BinanceTriangularProvider } from '../scanner/triangular/providers/binance';
import { BybitTriangularProvider } from '../scanner/triangular/providers/bybit';
import { OKXTriangularProvider } from '../scanner/triangular/providers/okx';
import { 
  TRIANGLE_PATHS, 
  TOTAL_FEE_MULTIPLIER, 
  MIN_TRIANGLE_PROFIT_PERCENT 
} from '../scanner/triangular/config';
import { TriangularOpportunity, TrianglePath, OrderbookSnapshot } from '../scanner/triangular/types';

function evaluateTriangle(
  exchange: string,
  path: TrianglePath,
  tickerMap: Map<string, OrderbookSnapshot>
): TriangularOpportunity | null {
  
  let currentAmount = 1.0; // Start with 1.0 units (e.g. USDT)
  const steps: string[] = [];

  for (const leg of [path.leg1, path.leg2, path.leg3]) {
    const ticker = tickerMap.get(leg.symbol);
    
    // If ANY leg is missing from the exchange's available pairs, the entire loop fails.
    if (!ticker) return null;

    if (leg.action === 'BUY') {
      // To buy base with quote, divide by ASK price (what sellers demand)
      currentAmount = currentAmount / ticker.askPrice;
      steps.push(`${leg.action} ${leg.symbol} @ ${ticker.askPrice}`);
    } else {
      // To sell base for quote, multiply by BID price (what buyers offer)
      currentAmount = currentAmount * ticker.bidPrice;
      steps.push(`${leg.action} ${leg.symbol} @ ${ticker.bidPrice}`);
    }
  }

  const grossMultiplier = currentAmount;
  const netMultiplier = grossMultiplier * TOTAL_FEE_MULTIPLIER;

  const netProfitPercent = (netMultiplier - 1) * 100;
  const grossProfitPercent = (grossMultiplier - 1) * 100;

  // We require a minimum net profit to surface as an actionable loop
  if (netProfitPercent > MIN_TRIANGLE_PROFIT_PERCENT) {
    return {
      exchange,
      trianglePath: path.id,
      step1Detail: steps[0],
      step2Detail: steps[1],
      step3Detail: steps[2],
      grossProfitPercent,
      netProfitPercent,
      confidenceScore: Math.min(100, Math.floor(netProfitPercent * 100)), // arbitrary scale
      timestamp: new Date()
    };
  }

  return null;
}

export async function runTriangularScanner() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('🚀 Starting Triangular Arbitrage Scanner...');

  const providers = [
    new BinanceTriangularProvider(),
    new BybitTriangularProvider(),
    new OKXTriangularProvider(),
  ];

  try {
    const foundOpportunities: TriangularOpportunity[] = [];

    // Fetch all trackers from all exchanges in parallel
    for (const provider of providers) {
      const tickerMap = await provider.fetchAllTickers();
      if (tickerMap.size === 0) continue;

      // Evaluate all pre-configured loops against this exchange's real-time orderbook
      for (const path of TRIANGLE_PATHS) {
        const opp = evaluateTriangle(provider.name, path, tickerMap);
        if (opp) {
          foundOpportunities.push(opp);
        }
      }
    }

    // 1. Deactivate older triangular records (Optional cleanup for active loops tracking)
    // Here we're just going to insert them sequentially and let the UI pull by DESC.
    
    // 2. Persist to Neon
    if (foundOpportunities.length > 0) {
      console.log(`📈 Discovered ${foundOpportunities.length} actionable Triangular paths!`);
      
      for (const opp of foundOpportunities) {
        await db.insert(triangularOpportunities).values({
          exchange: opp.exchange,
          trianglePath: opp.trianglePath,
          step1Detail: opp.step1Detail,
          step2Detail: opp.step2Detail,
          step3Detail: opp.step3Detail,
          grossProfitPercent: opp.grossProfitPercent.toString(),
          netProfitPercent: opp.netProfitPercent.toString(),
        });
      }

      // 3. Dispatch Alerts
      const proUsers = await db.select({
        telegramChatId: alertSettings.telegramChatId,
        minProfit: alertSettings.minProfit
      })
      .from(alertSettings)
      .innerJoin(subscriptions, eq(alertSettings.userClerkId, subscriptions.userClerkId))
      .where(and(
        eq(alertSettings.alertsEnabled, true),
        isNotNull(alertSettings.telegramChatId),
        eq(subscriptions.status, 'active')
      ));

      for (const opp of foundOpportunities) {
        // Send a telegram message about the loop
        const msg = [
          `🔺 <b>Triangular Arbitrage Loop Found!</b>`,
          ``,
          `🏛️ Exchange: <b>${opp.exchange}</b>`,
          `🛣️ Path: ${opp.trianglePath}`,
          ``,
          `1️⃣ ${opp.step1Detail}`,
          `2️⃣ ${opp.step2Detail}`,
          `3️⃣ ${opp.step3Detail}`,
          ``,
          `<b>Net Profit (After Fees): ${opp.netProfitPercent.toFixed(3)}%</b>`,
          ``,
          `⚠️ <i>Executes instantly without withdrawal risks. Phase 5 Auto-Execution coming soon.</i>`
        ].join('\n');

        // Broadcast to all active users with chat IDs (could optimize throttling later)
        for (const user of proUsers) {
          if (!user.telegramChatId) continue;
          await sendTelegramAlert(user.telegramChatId, msg).catch(() => {});
        }
      }
    } else {
      console.log('⚖️ No profitable triangular paths found under the threshold.');
    }

    return { status: 'completed', opportunities: foundOpportunities.length };

  } catch (err) {
    console.error('❌ Triangular Scanner Error:', err);
    throw err;
  }
}
