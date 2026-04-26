import { MarketPrice } from '../types';
import { SPOT_SYMBOLS } from '../config';

interface OKXTicker {
  instId: string;  // e.g. "BTC-USDT"
  bidPx: string;
  bidSz: string;
  askPx: string;
  askSz: string;
  ts: string;
}

/**
 * OKX Spot provider.
 * Uses GET /api/v5/market/tickers?instType=SPOT (public, no auth required).
 * OKX uses BTC-USDT format which we map to BTCUSDT.
 */
export class OKXSpotProvider {
  readonly name = 'OKX';
  private readonly baseUrl = 'https://www.okx.com';

  private toOKXSymbol(symbol: string): string {
    const base = symbol.replace('USDT', '');
    return `${base}-USDT`;
  }

  async fetchPrices(): Promise<MarketPrice[]> {
    try {
      const url = `${this.baseUrl}/api/v5/market/tickers?instType=SPOT`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.error(`❌ [OKX] HTTP ${res.status}`);
        return [];
      }

      const json = await res.json() as {
        code: string;
        data: OKXTicker[];
      };

      if (json.code !== '0') {
        console.error(`❌ [OKX] API error code: ${json.code}`);
        return [];
      }

      const tickerMap = new Map<string, OKXTicker>();
      for (const ticker of json.data) {
        tickerMap.set(ticker.instId, ticker);
      }

      const prices: MarketPrice[] = [];
      for (const symbol of SPOT_SYMBOLS) {
        const okxSymbol = this.toOKXSymbol(symbol);
        const ticker = tickerMap.get(okxSymbol);
        if (!ticker) {
          console.warn(`⚠️ [OKX] Symbol ${okxSymbol} not found`);
          continue;
        }

        const bidPrice = parseFloat(ticker.bidPx);
        const bidQty = parseFloat(ticker.bidSz);
        const askPrice = parseFloat(ticker.askPx);
        const askQty = parseFloat(ticker.askSz);

        if (!bidPrice || !askPrice || isNaN(bidPrice) || isNaN(askPrice)) {
          console.warn(`⚠️ [OKX] Invalid price data for ${symbol}`);
          continue;
        }

        prices.push({
          exchange: this.name,
          symbol,
          bidPrice,
          bidQty,
          askPrice,
          askQty,
          timestamp: new Date(parseInt(ticker.ts)),
          source: 'real',
        });
      }

      console.log(`✅ [OKX] Fetched ${prices.length}/${SPOT_SYMBOLS.length} symbols.`);
      return prices;
    } catch (err) {
      console.error('❌ [OKX] Provider failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
