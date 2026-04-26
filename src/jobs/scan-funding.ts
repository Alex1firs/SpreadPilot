import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { fundingRates, alertSettings, subscriptions } from '../db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendTelegramAlert } from '@/lib/telegram';

import { BinanceFundingProvider } from '../scanner/funding/providers/binance';
import { BybitFundingProvider } from '../scanner/funding/providers/bybit';
import { FundingRateScanResult } from '../scanner/funding/types';

const MIN_ALERT_APY_PERCENT = 100; // Only alert if annualized yield > 100%

export async function runFundingScanner() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('🚀 Starting Funding Rate Scanner...');

  const providers = [
    new BinanceFundingProvider(),
    new BybitFundingProvider(),
  ];

  try {
    const allResults: FundingRateScanResult[] = [];

    // Fetch funding rates from exchanges
    for (const provider of providers) {
      const results = await provider.fetchFundingRates();
      allResults.push(...results);
    }

    if (allResults.length === 0) {
      console.log('⚖️ No funding rates retrieved.');
      return { status: 'completed', count: 0 };
    }

    // 1. Clear old funding rates immediately to keep DB clean
    // A simple `delete` is fine since these update constantly and historical
    // funding rates don't provide arbitrage value like past gaps do.
    await db.delete(fundingRates);

    // 2. Sort by APY descending
    allResults.sort((a, b) => b.annualizedYield - a.annualizedYield);

    // Keep top 50
    const topYields = allResults.slice(0, 50);

    console.log(`📈 Storing ${topYields.length} top funding rates!`);

    for (const item of topYields) {
      await db.insert(fundingRates).values({
        exchange: item.exchange,
        symbol: item.symbol,
        fundingRate: item.fundingRate.toString(),
        annualizedYield: item.annualizedYield.toString(),
        nextFundingTime: item.nextFundingTime,
      });
    }

    // 3. Dispatch Alerts
    // We only want to trigger alerts for the absolute best ones that cross the MIN_ALERT_APY_PERCENT boundary
    const actionableYields = topYields.filter(y => Math.abs(y.annualizedYield) > MIN_ALERT_APY_PERCENT);

    if (actionableYields.length > 0) {
      const proUsers = await db.select({
        telegramChatId: alertSettings.telegramChatId,
      })
      .from(alertSettings)
      .innerJoin(subscriptions, eq(alertSettings.userClerkId, subscriptions.userClerkId))
      .where(and(
        eq(alertSettings.alertsEnabled, true),
        isNotNull(alertSettings.telegramChatId),
        eq(subscriptions.status, 'active')
      ));

      // Just alert the top 3 maximums to avoid spam
      const topAlerts = actionableYields.slice(0, 3);
      
      const msgLines = [
        `🔥 <b>High Yield Funding Rate Alert!</b>`,
        `Certain pairs are currently paying massive APY to Delta-Neutral traders.`,
        ``
      ];

      for (const y of topAlerts) {
        msgLines.push(`🪙 <b>${y.symbol}</b> on ${y.exchange}`);
        msgLines.push(`Yield: <b>${y.annualizedYield.toFixed(2)}% APY</b>`);
        msgLines.push(`Next Payout: ${y.nextFundingTime.toLocaleTimeString()}`);
        msgLines.push(``);
      }
      
      msgLines.push(`💡 Go Spot Long + Perpetual Short to collect yield safely.`);

      const msg = msgLines.join('\n');

      for (const user of proUsers) {
        if (!user.telegramChatId) continue;
        await sendTelegramAlert(user.telegramChatId, msg).catch(() => {});
      }
    }

    return { status: 'completed', count: topYields.length };

  } catch (err) {
    console.error('❌ Funding Rate Scanner Error:', err);
    throw err;
  }
}
