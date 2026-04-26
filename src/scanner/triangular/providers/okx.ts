import { OrderbookSnapshot } from '../types';

export class OKXTriangularProvider {
  readonly name = 'OKX';
  private readonly baseUrl = 'https://www.okx.com';

  async fetchAllTickers(): Promise<Map<string, OrderbookSnapshot>> {
    try {
      const url = `${this.baseUrl}/api/v5/market/tickers?instType=SPOT`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`⚠️ [OKX Triangular] HTTP ${res.status}`);
        return new Map();
      }

      const payload = await res.json() as {
        code: string;
        data: Array<{
          instId: string;
          bidPx: string;
          askPx: string;
        }>;
      };

      if (payload.code !== "0" || !payload.data) {
        return new Map();
      }

      const tickerMap = new Map<string, OrderbookSnapshot>();
      for (const item of payload.data) {
        // OKX format is BASE-QUOTE (e.g. BTC-USDT)
        // We strip the hyphen to normalize it to BTCUSDT
        const normalizedSymbol = item.instId.replace('-', '');
        
        const bidPrice = parseFloat(item.bidPx);
        const askPrice = parseFloat(item.askPx);
        
        if (!isNaN(bidPrice) && !isNaN(askPrice) && bidPrice > 0 && askPrice > 0) {
          tickerMap.set(normalizedSymbol, {
            symbol: normalizedSymbol,
            bidPrice,
            askPrice,
          });
        }
      }

      return tickerMap;
    } catch (err) {
      console.error(`❌ [OKX Triangular] Fetch failed:`, err instanceof Error ? err.message : err);
      return new Map();
    }
  }
}
