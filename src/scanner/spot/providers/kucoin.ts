import { MarketPrice, SpotSymbol } from '../types';
import { SPOT_SYMBOLS } from '../config';

interface KuCoinTickerItem {
  symbol: string;
  buy: string;   // best ask price
  sell: string;  // best bid price
  bestBidSize: string;
  bestAskSize: string;
}

/**
 * KuCoin Spot provider.
 * Uses GET /api/v1/market/allTickers (public, no auth required).
 * KuCoin uses BTC-USDT format; we map to BTCUSDT.
 * NOTE: KuCoin "buy" = market asks (you can buy here), "sell" = market bids (you can sell here).
 */
export class KuCoinSpotProvider {
  readonly name = 'KuCoin';
  private readonly baseUrl = 'https://api.kucoin.com';

  // Map BTCUSDT → BTC-USDT
  private toKuCoinSymbol(symbol: SpotSymbol): string {
    const base = symbol.replace('USDT', '');
    return `${base}-USDT`;
  }

  async fetchPrices(): Promise<MarketPrice[]> {
    try {
      const url = `${this.baseUrl}/api/v1/market/allTickers`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        console.error(`❌ [KuCoin] HTTP ${res.status}`);
        return [];
      }

      const json = await res.json() as {
        code: string;
        data: {
          time: number;
          ticker: KuCoinTickerItem[];
        };
      };

      if (json.code !== '200000') {
        console.error(`❌ [KuCoin] API error code: ${json.code}`);
        return [];
      }

      const tickerMap = new Map<string, KuCoinTickerItem>();
      for (const ticker of json.data.ticker) {
        tickerMap.set(ticker.symbol, ticker);
      }

      const prices: MarketPrice[] = [];
      for (const symbol of SPOT_SYMBOLS) {
        const kcSymbol = this.toKuCoinSymbol(symbol);
        const ticker = tickerMap.get(kcSymbol);
        if (!ticker) {
          console.warn(`⚠️ [KuCoin] Symbol ${kcSymbol} not found in response`);
          continue;
        }

        // KuCoin field naming:
        // "buy"  = best bid price (highest price a buyer will pay)
        // "sell" = best ask price (lowest price a seller will accept)
        const bidPrice = parseFloat(ticker.buy);   // bid
        const askPrice = parseFloat(ticker.sell);  // ask
        const bidQty   = parseFloat(ticker.bestBidSize ?? '0');
        const askQty   = parseFloat(ticker.bestAskSize ?? '0');

        if (!bidPrice || !askPrice || isNaN(bidPrice) || isNaN(askPrice)) {
          console.warn(`⚠️ [KuCoin] Invalid price data for ${symbol}`);
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

      console.log(`✅ [KuCoin] Fetched ${prices.length}/${SPOT_SYMBOLS.length} symbols.`);
      return prices;
    } catch (err) {
      console.error('❌ [KuCoin] Provider failed:', err instanceof Error ? err.message : err);
      return [];
    }
  }
}
