import { FundingRateScanResult, TOP_TIER_SYMBOLS } from '../types';

export class BybitFundingProvider {
  readonly name = 'Bybit';
  private readonly baseUrl = 'https://api.bybit.com';

  async fetchFundingRates(): Promise<FundingRateScanResult[]> {
    try {
      const url = `${this.baseUrl}/v5/market/tickers?category=linear`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Bybit Funding] HTTP ${res.status}`);
        return [];
      }

      const payload = await res.json() as {
        retCode: number;
        result: {
          list: Array<{
            symbol: string;
            fundingRate: string;
            nextFundingTime: string;
          }>;
        }
      };

      if (payload.retCode !== 0 || !payload.result || !payload.result.list) {
        return [];
      }

      const results: FundingRateScanResult[] = [];
      
      for (const item of payload.result.list) {
        if (!TOP_TIER_SYMBOLS.has(item.symbol)) continue;

        const fundingRate = parseFloat(item.fundingRate);
        if (isNaN(fundingRate)) continue;

        const annualizedYield = fundingRate * 3 * 365 * 100;
        
        results.push({
          exchange: this.name,
          symbol: item.symbol,
          fundingRate,
          annualizedYield,
          nextFundingTime: new Date(parseInt(item.nextFundingTime))
        });
      }

      return results;
    } catch (err) {
      console.error(`❌ [Bybit Funding] Fetch failed:`, err instanceof Error ? err.message : err);
      return [];
    }
  }
}
