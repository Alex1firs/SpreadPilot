import { OrderbookSnapshot } from '../types';

export class BybitTriangularProvider {
  readonly name = 'Bybit';
  private readonly baseUrl = 'https://api.bybit.com';

  async fetchAllTickers(): Promise<Map<string, OrderbookSnapshot>> {
    try {
      const url = `${this.baseUrl}/v5/market/tickers?category=spot`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Bybit Triangular] HTTP ${res.status}`);
        return new Map();
      }

      const payload = await res.json() as {
        retCode: number;
        result: {
          list: Array<{
            symbol: string;
            bid1Price: string;
            ask1Price: string;
          }>;
        };
      };

      if (payload.retCode !== 0 || !payload.result || !payload.result.list) {
        return new Map();
      }

      const tickerMap = new Map<string, OrderbookSnapshot>();
      for (const item of payload.result.list) {
        const bidPrice = parseFloat(item.bid1Price);
        const askPrice = parseFloat(item.ask1Price);
        
        if (!isNaN(bidPrice) && !isNaN(askPrice) && bidPrice > 0 && askPrice > 0) {
          tickerMap.set(item.symbol, {
            symbol: item.symbol,
            bidPrice,
            askPrice,
          });
        }
      }

      return tickerMap;
    } catch (err) {
      console.error(`❌ [Bybit Triangular] Fetch failed:`, err instanceof Error ? err.message : err);
      return new Map();
    }
  }
}
