import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { listingAlerts, alertSettings, subscriptions } from '../db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendTelegramAlert } from '@/lib/telegram';

const BINANCE_ANNOUNCEMENT_API = 'https://www.binance.com/bapi/composite/v1/public/cms/article/list/query?type=1&catalogId=48&pageNo=1&pageSize=10';

export async function runListingScanner() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('📡 Starting Binance Listing Monitor...');

  try {
    const response = await fetch(BINANCE_ANNOUNCEMENT_API);
    const result = await response.json();

    if (!result.data || !result.data.catalogs) {
      console.warn('⚠️ Could not fetch announcements from Binance.');
      return;
    }

    const articles = result.data.catalogs[0].articles;
    const newAlerts = [];

    for (const article of articles) {
      const title = article.title;
      
      // Look for "Will List" or "Will Add ... Futures"
      if (title.toLowerCase().includes('will list') || title.toLowerCase().includes('will launch')) {
        // Extract symbol: e.g. "Binance Will List Chip (CHIP)" -> CHIP
        const symbolMatch = title.match(/\(([^)]+)\)/) || title.match(/List\s+([A-Z0-9]+)/i);
        const symbol = symbolMatch ? symbolMatch[1].toUpperCase() : 'UNKNOWN';

        // Check if we've seen this announcement code before
        const existing = await db.select()
          .from(listingAlerts)
          .where(eq(listingAlerts.announcementCode, article.code))
          .limit(1);

        if (existing.length === 0) {
          console.log(`🆕 NEW LISTING DETECTED: ${symbol} - ${title}`);
          
          await db.insert(listingAlerts).values({
            title: title,
            symbol: symbol,
            announcementCode: article.code,
            releaseDate: new Date(article.releaseDate),
          });

          newAlerts.push({ symbol, title, code: article.code });
        }
      }
    }

    if (newAlerts.length > 0) {
      // Broadcast to PRO/PREMIUM users
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

      for (const alert of newAlerts) {
        const msg = [
          `🚨 <b>CRITICAL: New Binance Listing!</b>`,
          ``,
          `<b>Token:</b> ${alert.symbol}`,
          `<b>News:</b> ${alert.title}`,
          ``,
          `💡 <b>Arbitrage Insight:</b>`,
          `This token is likely already trading on <b>MEXC or Gate.io</b>. Check those exchanges immediately to buy BEFORE the Binance pump!`,
          ``,
          `🔗 <a href="https://www.binance.com/en/support/announcement/${alert.code}">Read Full Announcement</a>`
        ].join('\n');

        for (const user of proUsers) {
          if (!user.telegramChatId) continue;
          await sendTelegramAlert(user.telegramChatId, msg).catch(() => {});
        }
      }
    }

    return { status: 'completed', newAlerts: newAlerts.length };

  } catch (err) {
    console.error('❌ Listing Monitor Error:', err);
    throw err;
  }
}
