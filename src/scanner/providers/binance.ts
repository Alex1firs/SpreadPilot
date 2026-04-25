import { P2PPrice, PriceProvider } from "../types";
import { SCANNER_CONFIG } from "../config";

export class BinanceProvider implements PriceProvider {
  name = "Binance";

  async fetchPrices(): Promise<P2PPrice> {
    if (SCANNER_CONFIG.USE_REAL_BINANCE) {
      try {
        const prices = await this.fetchRealPrices();
        if (prices) return prices;
      } catch (error) {
        console.error("❌ Binance Real API Error:", error instanceof Error ? error.message : error);
      }
    }

    // Default Simulated Data
    const basePrice = 1645 + Math.random() * 10;
    return {
      exchange: this.name,
      currency: "USDT/NGN",
      buyPrice: basePrice,
      sellPrice: basePrice + 12,
      lastUpdated: new Date(),
    };
  }

  private async fetchRealPrices(): Promise<P2PPrice | null> {
    const url = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
    
    const fetchAds = async (type: "BUY" | "SELL") => {
      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        body: JSON.stringify({
          proMerchantAds: false,
          page: 1,
          rows: 5,
          payTypes: [],
          countries: [],
          publisherType: null,
          asset: "USDT",
          fiat: "NGN",
          tradeType: type,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json() as { 
        code: string; 
        data: Array<{ adv: { price: string } }> 
      };
      
      if (json.code !== "000000") throw new Error(`API Code: ${json.code}`);
      return json.data || [];
    };

    // Note: Due to regulatory changes in 2024, Binance NGN P2P may return empty ads.
    const buyAds = await fetchAds("SELL");
    const sellAds = await fetchAds("BUY");

    if (buyAds.length === 0 || sellAds.length === 0) {
      console.warn("⚠️ [Binance] No active NGN P2P ads found. This is expected due to market restrictions in Nigeria. Falling back to simulation...");
      return null;
    }

    const buyPrice = parseFloat(buyAds[0].adv.price);
    const sellPrice = parseFloat(sellAds[0].adv.price);

    console.log(`✅ [Binance Real] Fetched prices: Buy: ₦${buyPrice} | Sell: ₦${sellPrice}`);

    return {
      exchange: this.name,
      currency: "USDT/NGN",
      buyPrice,
      sellPrice,
      lastUpdated: new Date(),
    };
  }
}
