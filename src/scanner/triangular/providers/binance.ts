import { OrderbookSnapshot } from '../types';

export class BinanceTriangularProvider {
  readonly name = 'Binance';
  private readonly baseUrl = 'https://api.binance.com';

  async fetchAllTickers(): Promise<Map<string, OrderbookSnapshot>> {
    try {
      const url = `${this.baseUrl}/api/v3/ticker/bookTicker`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Binance Triangular] HTTP ${res.status}`);
        return new Map();
      }

      const data = await res.json() as Array<{
        symbol: string;
        bidPrice: string;
        askPrice: string;
      }>;

      const tickerMap = new Map<string, OrderbookSnapshot>();
      for (const item of data) {
        const bidPrice = parseFloat(item.bidPrice);
        const askPrice = parseFloat(item.askPrice);
        
        if (!isNaN(bidPrice) && !isNaN(askPrice) && bidPrice > 0 && askPrice > 0) {
          tickerMap.set(item.symbol, {
            symbol: item.symbol,
            bidPrice,
            askPrice,
          });
        }
      }

      // console.log(`✅ [Binance Triangular] Loaded ${tickerMap.size} valid pairs instantly.`);
      return tickerMap;
    } catch (err) {
      console.error(`❌ [Binance Triangular] Fetch failed:`, err instanceof Error ? err.message : err);
      return new Map();
    }
  }
}
