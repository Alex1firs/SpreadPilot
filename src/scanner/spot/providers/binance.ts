import { MarketPrice, SpotSymbol } from '../types';
import { SPOT_SYMBOLS } from '../config';

/**
 * Binance Spot provider.
 * Uses GET /api/v3/ticker/bookTicker (public, no auth required).
 * Returns best bid and ask for all requested symbols.
 */
export class BinanceSpotProvider {
  readonly name = 'Binance';
  private readonly baseUrl = 'https://api.binance.com';

  async fetchPrices(): Promise<MarketPrice[]> {
    try {
      // Fetch individual book tickers for each symbol simultaneously
      const results = await Promise.all(
        SPOT_SYMBOLS.map((symbol) => this.fetchSymbol(symbol))
      );
      const prices = results.filter((p): p is MarketPrice => p !== null);
      console.log(`✅ [Binance] Fetched ${prices.length}/${SPOT_SYMBOLS.length} symbols.`);
      return prices;
    } catch (err) {
      console.error('❌ [Binance] Provider failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  private async fetchSymbol(symbol: SpotSymbol): Promise<MarketPrice | null> {
    try {
      const url = `${this.baseUrl}/api/v3/ticker/bookTicker?symbol=${symbol}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Binance] HTTP ${res.status} for ${symbol}`);
        return null;
      }

      const data = await res.json() as {
        symbol: string;
        bidPrice: string;
        bidQty: string;
        askPrice: string;
        askQty: string;
      };

      const bidPrice = parseFloat(data.bidPrice);
      const askPrice = parseFloat(data.askPrice);
      const bidQty = parseFloat(data.bidQty);
      const askQty = parseFloat(data.askQty);

      if (!bidPrice || !askPrice || isNaN(bidPrice) || isNaN(askPrice)) {
        console.warn(`⚠️ [Binance] Invalid price data for ${symbol}`);
        return null;
      }

      return {
        exchange: this.name,
        symbol,
        bidPrice,
        bidQty,
        askPrice,
        askQty,
        timestamp: new Date(),
        source: 'real',
      };
    } catch (err) {
      console.error(`❌ [Binance] Failed to fetch ${symbol}:`, err instanceof Error ? err.message : err);
      return null;
    }
  }
}
