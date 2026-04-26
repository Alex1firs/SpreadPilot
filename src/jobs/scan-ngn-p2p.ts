import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { ngnP2pSpreads, alertSettings, subscriptions } from '../db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { sendTelegramAlert } from '@/lib/telegram';

interface BybitP2PResponse {
  ret_code: number;
  ret_msg: string;
  result: {
    items: Array<{
      price: string;
    }>;
  };
}

export async function runNgnP2pScanner() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('🚀 Starting NGN P2P vs Spot Scanner...');

  try {
    // 1. Fetch Official USD/NGN Rate from External API
    const erResponse = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!erResponse.ok) throw new Error("Failed to fetch official FX rate");
    
    const erData = await erResponse.json() as { rates: { NGN?: number } };
    const spotRateNgn = erData.rates?.NGN;
    if (!spotRateNgn) throw new Error("NGN rate missing from FX provider");

    // 2. Fetch Bybit P2P Rate
    const bybitUrl = "https://api2.bybit.com/fiat/otc/item/list";
    const fetchAds = async (side: "0" | "1") => {
      const response = await fetch(bybitUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Origin": "https://www.bybit.com",
          "Referer": "https://www.bybit.com/",
        },
        body: JSON.stringify({
          tokenId: "USDT",
          currencyId: "NGN",
          payment: [],
          side: side,
          size: "5",
          page: "1",
          amount: "",
        }),
      });

      if (!response.ok) throw new Error(`Bybit HTTP ${response.status}`);
      const json = await response.json() as BybitP2PResponse;
      if (json.ret_code !== 0) throw new Error(`Bybit API Error: ${json.ret_msg}`);
      return json.result.items || [];
    };

    // side "1" = Sellers (Buy USDT) | side "0" = Buyers (Sell USDT)
    const sellerAds = await fetchAds("1");
    const buyerAds = await fetchAds("0");

    if (sellerAds.length === 0 || buyerAds.length === 0) {
      throw new Error("No P2P ads found on Bybit");
    }

    const p2pBuyRate = parseFloat(sellerAds[0].price);
    const p2pSellRate = parseFloat(buyerAds[0].price);

    // 3. Calculate Gap
    // Case 1: Gap happens when P2P price is significantly lower than Spot (Buy opportunity)
    // Buy on P2P -> Spot value is higher -> Gain. 
    // Gap % = ((spotRateNgn - p2pBuyRate) / p2pBuyRate) * 100
    const spreadPercent = ((spotRateNgn - p2pBuyRate) / p2pBuyRate) * 100;

    // 4. Record to DB
    await db.insert(ngnP2pSpreads).values({
      p2pBuyRate: p2pBuyRate.toString(),
      p2pSellRate: p2pSellRate.toString(),
      spotRateNgn: spotRateNgn.toString(),
      spreadPercent: spreadPercent.toString()
    });

    console.log(`✅ Recorded NGN P2P Spread: Spot=₦${spotRateNgn.toFixed(2)}, P2P Buy=₦${p2pBuyRate}, Gap=${spreadPercent.toFixed(2)}%`);

    // 5. Alert Trigger logic
    // Alert if Gap > 2% (arbitrage window)
    if (spreadPercent > 2.0 || spreadPercent < -1.0) {
      // Find pro users to notify
      const proUsers = await db.select({
        telegramChatId: alertSettings.telegramChatId,
      })
      .from(alertSettings)
      .innerJoin(subscriptions, eq(alertSettings.userClerkId, subscriptions.userClerkId))
      .where(and(
        eq(alertSettings.alertsEnabled, true),
        isNotNull(alertSettings.telegramChatId),
        eq(subscriptions.status, 'active'),
      ));

      let action = '';
      if (spreadPercent > 2.0) {
          action = `💡 Action: BUY USDT on P2P at ₦${p2pBuyRate} (below market value)`;
      } else {
          action = `💡 Action: SELL USDT on P2P at ₦${p2pSellRate} (premium above market value)`;
      }

      for (const user of proUsers) {
        if (!user.telegramChatId) continue;
        const msg = [
          `🇳🇬 <b>NGN Arbitrage Alert!</b>`,
          ``,
          `P2P USDT Buy Price: ₦${p2pBuyRate}`,
          `Spot USDT Value: ₦${spotRateNgn.toFixed(2)}`,
          `<b>GAP: ${spreadPercent > 0 ? '+' : ''}${spreadPercent.toFixed(2)}%</b>`,
          ``,
          action,
          `⚡ Window may close in 15–30 minutes`
        ].join('\n');
        await sendTelegramAlert(user.telegramChatId, msg).catch(() => {});
      }
    }

    return { 
      success: true, 
      p2pBuyRate, 
      p2pSellRate, 
      spotRateNgn, 
      spreadPercent 
    };

  } catch (error) {
    console.error('❌ NGN P2P Scanner Error:', error);
    return { success: false, error: String(error) };
  }
}
