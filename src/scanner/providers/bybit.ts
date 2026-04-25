import { P2PPrice, PriceProvider } from "../types";
import { SCANNER_CONFIG } from "../config";

interface BybitP2PResponse {
  ret_code: number;
  ret_msg: string;
  result: {
    items: Array<{
      price: string;
      nickName: string;
      lastQuantity: string;
      payments: string[];
    }>;
  };
}

export class BybitProvider implements PriceProvider {
  name = "Bybit";

  async fetchPrices(): Promise<P2PPrice> {
    if (SCANNER_CONFIG.USE_REAL_BYBIT) {
      try {
        const prices = await this.fetchRealPrices();
        if (prices) return prices;
      } catch (error) {
        console.error("❌ Bybit Real API failed:", error instanceof Error ? error.message : error);
      }
    }

    // Default Simulated Data
    const basePrice = 1655 + Math.random() * 10;
    return {
      exchange: this.name,
      currency: "USDT/NGN",
      buyPrice: basePrice,
      sellPrice: basePrice + 10,
      lastUpdated: new Date(),
    };
  }

  private async fetchRealPrices(): Promise<P2PPrice | null> {
    // We try two common endpoints for resilience
    const endpoints = [
      "https://api2.bybit.com/fiat/otc/item/list",
      "https://api2.bytick.com/fiat/otc/item/list"
    ];

    let lastError = null;

    for (const url of endpoints) {
      try {
        const fetchAds = async (side: "0" | "1") => {
          const response = await fetch(url, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Origin": "https://www.bybit.com",
              "Referer": "https://www.bybit.com/",
            },
            body: JSON.stringify({
              tokenId: "USDT",
              currencyId: "NGN",
              payment: [],
              side: side,
              size: "10",
              page: "1",
              amount: "10000",
            }),
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const json = await response.json() as BybitP2PResponse;
          
          if (json.ret_code !== 0) throw new Error(`API Error: ${json.ret_msg}`);
          return json.result.items || [];
        };

        // side "1" = Sellers (Buy USDT) | side "0" = Buyers (Sell USDT)
        const sellerAds = await fetchAds("1");
        const buyerAds = await fetchAds("0");

        if (sellerAds.length > 0 && buyerAds.length > 0) {
          const buyPrice = parseFloat(sellerAds[0].price);
          const sellPrice = parseFloat(buyerAds[0].price);

          console.log(`✅ [Bybit Real] Fetched via ${new URL(url).hostname}: Buy: ₦${buyPrice} | Sell: ₦${sellPrice}`);

          return {
            exchange: this.name,
            currency: "USDT/NGN",
            buyPrice,
            sellPrice,
            lastUpdated: new Date(),
          };
        }
      } catch (err) {
        lastError = err;
        continue; // Try next endpoint
      }
    }

    if (lastError) {
      console.warn(`⚠️ [Bybit] Real API attempt failed or returned 0 ads. Falling back to simulation. (Last error: ${lastError instanceof Error ? lastError.message : 'Unknown'})`);
    }
    return null;
  }
}
