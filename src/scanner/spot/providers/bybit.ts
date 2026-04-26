import { MarketPrice } from '../types';
import { SPOT_SYMBOLS } from '../config';

interface BybitTicker {
  symbol: string;
  bid1Price: string;
  bid1Size: string;
  ask1Price: string;
  ask1Size: string;
}

/**
 * Bybit Spot provider.
 * Uses GET /v5/market/tickers?category=spot (public, no auth required).
 * Extracts bid1Price and ask1Price.
 */
export class BybitSpotProvider {
  readonly name = 'Bybit';
  private readonly baseUrl = 'https://api.bybit.com';

  async fetchPrices(): Promise<MarketPrice[]> {
    try {
      const url = `${this.baseUrl}/v5/market/tickers?category=spot`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.error(`❌ [Bybit] HTTP ${res.status}`);
        return [];
      }

      const json = await res.json() as {
        retCode: number;
        retMsg: string;
        result: { list: BybitTicker[] };
      };

      if (json.retCode !== 0) {
        console.error(`❌ [Bybit] API error: ${json.retMsg}`);
        return [];
      }

      const tickerMap = new Map<string, BybitTicker>();
      for (const ticker of json.result.list) {
        tickerMap.set(ticker.symbol, ticker);
      }

      const prices: MarketPrice[] = [];
      for (const symbol of SPOT_SYMBOLS) {
        const ticker = tickerMap.get(symbol);
        if (!ticker) {
          console.warn(`⚠️ [Bybit] Symbol ${symbol} not found in response`);
          continue;
        }

        const bidPrice = parseFloat(ticker.bid1Price);
        const bidQty = parseFloat(ticker.bid1Size);
        const askPrice = parseFloat(ticker.ask1Price);
        const askQty = parseFloat(ticker.ask1Size);

        if (!bidPrice || !askPrice || isNaN(bidPrice) || isNaN(askPrice)) {
          console.warn(`⚠️ [Bybit] Invalid price data for ${symbol}`);
          continue;
        }

        prices.push({
          exchange: this.name,
          symbol,
          bidPrice,
          bidQty,
          askPrice,
          askQty,
          timestamp: new Date(),
          source: 'real',
        });
      }

      console.log(`✅ [Bybit] Fetched ${prices.length}/${SPOT_SYMBOLS.length} symbols.`);
      return prices;
    } catch (err) {
      console.error('❌ [Bybit] Provider failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
