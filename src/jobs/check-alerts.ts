import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, isNotNull, sql } from 'drizzle-orm';
import { opportunities, alertSettings, alertLogs, subscriptions } from '../db/schema';
import { sendTelegramAlert } from '../lib/telegram';


const RISK_MAP: Record<string, number> = {
  'Low': 1,
  'Medium': 2,
  'High': 3
};

export async function runAlertCheck() {
  const client = neon(process.env.DATABASE_URL!);
  const db = drizzle(client);

  console.log('🔍 Starting Telegram Alerts Dispatch Job...');

  // 1. Fetch active opportunities
  const activeOpps = await db.select().from(opportunities).where(eq(opportunities.isActive, true));
  if (activeOpps.length === 0) {
    console.log('No active opportunities found. Exiting.');
    return { status: 'completed', alertsSent: 0 };
  }

  // 2. Fetch users with alerts enabled AND a pro/premium subscription
  // We join with subscriptions to verify plan status
  const activeUsers = await db.select({
    userClerkId: alertSettings.userClerkId,
    telegramChatId: alertSettings.telegramChatId,
    minSpread: alertSettings.minSpread,
    minProfit: alertSettings.minProfit,
    maxRiskLevel: alertSettings.maxRiskLevel,
    plan: subscriptions.plan,
  })
    .from(alertSettings)
    .innerJoin(subscriptions, eq(alertSettings.userClerkId, subscriptions.userClerkId))
    .where(and(
      eq(alertSettings.alertsEnabled, true), 
      isNotNull(alertSettings.telegramChatId),
      eq(subscriptions.status, 'active'),
      // Ensure subscription has not expired
      sql`(${subscriptions.endDate} IS NULL OR ${subscriptions.endDate} > NOW())`
    ));

  // Filter out Free plan users for alerts
  const proUsers = activeUsers.filter(u => u.plan === 'Pro' || u.plan === 'Premium');

  if (proUsers.length === 0) {
    console.log('No Pro/Premium users with active Telegram alerts configured.');
    return { status: 'completed', alertsSent: 0 };
  }

  // 3. Fetch past alert logs
  const pastLogs = await db.select().from(alertLogs);
  const sentSet = new Set(pastLogs.map(l => `${l.userClerkId}-${l.opportunityId}`));

  let sentCount = 0;

  for (const user of proUsers) {
    const minSpread = Number(user.minSpread);
    const minProfit = Number(user.minProfit);
    const maxRiskVal = RISK_MAP[user.maxRiskLevel] || 2;

    for (const opp of activeOpps) {
      if (sentSet.has(`${user.userClerkId}-${opp.id}`)) continue;

      const oppSpread = Number(opp.spread);
      const oppProfit = Number(opp.netProfit);
      const oppRiskVal = RISK_MAP[opp.riskLevel] || 3;

      if (oppSpread >= minSpread && oppProfit >= minProfit && oppRiskVal <= maxRiskVal) {
        const message = `
🚀 <b>New Arbitrage Opportunity</b>
<b>Route:</b> ${opp.buyExchange} ➡️ ${opp.sellExchange}
<b>Net Profit:</b> ₦${Number(opp.netProfit).toLocaleString()} 💎
<b>Spread:</b> ${opp.spread}%
<b>Confidence:</b> ${opp.confidenceScore}%

📊 <b>Breakdown (${opp.volumeUsdt} USDT):</b>
- Gross: ₦${Number(opp.grossProfit).toLocaleString()}
- Fees: ₦${Number(opp.estimatedFees).toLocaleString()}
- Slippage: ₦${Number(opp.slippageBuffer).toLocaleString()}

⚠️ <b>Risk:</b> ${opp.riskLevel}
🏦 <b>Payment:</b> ${opp.paymentMethod}
`;

        try {
          await sendTelegramAlert(user.telegramChatId!, message.trim());
          await db.insert(alertLogs).values({
            userClerkId: user.userClerkId,
            opportunityId: opp.id,
            channel: 'telegram'
          });
          sentSet.add(`${user.userClerkId}-${opp.id}`);
          sentCount++;
          console.log(`✅ Sent alert to ${user.telegramChatId} for ${opp.buyExchange}->${opp.sellExchange}`);
        } catch (err) {
          console.error(`❌ Failed to send alert to ${user.telegramChatId}:`, err);
        }
      }
    }
  }

  console.log(`\n🎉 Job Complete: ${sentCount} alerts sent.`);
  return { status: 'completed', alertsSent: sentCount };
}

// Allow CLI execution
if (process.argv[1] && (import.meta.url.endsWith(process.argv[1]) || process.argv[1].endsWith('check-alerts.ts'))) {
  runAlertCheck().catch(err => {
    console.error("Critical Job Error:", err);
    process.exit(1);
  });
}
