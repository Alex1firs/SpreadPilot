import { MarketPrice, SpotSymbol } from '../types';
import { SPOT_SYMBOLS } from '../config';

/**
 * Gate.io Spot provider.
 * Uses GET /api/v4/spot/order_book (public, no auth required).
 * Returns best bid and ask.
 */
export class GateIoSpotProvider {
  readonly name = 'GateIo';
  private readonly baseUrl = 'https://api.gateio.ws';

  async fetchPrices(): Promise<MarketPrice[]> {
    try {
      // Fetch individual order books for each symbol simultaneously
      const results = await Promise.all(
        SPOT_SYMBOLS.map((symbol) => this.fetchSymbol(symbol))
      );
      const prices = results.filter((p): p is MarketPrice => p !== null);
      console.log(`✅ [Gate.io] Fetched ${prices.length}/${SPOT_SYMBOLS.length} symbols.`);
      return prices;
    } catch (err) {
      console.error('❌ [Gate.io] Provider failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  private async fetchSymbol(symbol: SpotSymbol): Promise<MarketPrice | null> {
    try {
      // Gate.io uses BASE_QUOTE format, e.g. BTC_USDT
      const formattedSymbol = symbol.replace('USDT', '_USDT');
      const url = `${this.baseUrl}/api/v4/spot/order_book?currency_pair=${formattedSymbol}&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Gate.io] HTTP ${res.status} for ${symbol}`);
        return null;
      }

      const data = await res.json() as {
        current: number;
        asks: [string, string][];
        bids: [string, string][];
      };

      if (!data.bids || data.bids.length === 0 || !data.asks || data.asks.length === 0) {
        return null;
      }

      const bidPrice = parseFloat(data.bids[0][0]);
      const bidQty = parseFloat(data.bids[0][1]);
      const askPrice = parseFloat(data.asks[0][0]);
      const askQty = parseFloat(data.asks[0][1]);

      if (!bidPrice || !askPrice || isNaN(bidPrice) || isNaN(askPrice)) {
        console.warn(`⚠️ [Gate.io] Invalid price data for ${symbol}`);
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
      console.error(`❌ [Gate.io] Failed to fetch ${symbol}:`, err instanceof Error ? err.message : err);
      return null;
    }
  }
}
