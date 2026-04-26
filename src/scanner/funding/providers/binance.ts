import { FundingRateScanResult, TOP_TIER_SYMBOLS } from '../types';

export class BinanceFundingProvider {
  readonly name = 'Binance';
  private readonly baseUrl = 'https://fapi.binance.com';

  async fetchFundingRates(): Promise<FundingRateScanResult[]> {
    try {
      // fapi premiumIndex endpoint returns funding rates for all perpetuals
      const url = `${this.baseUrl}/fapi/v1/premiumIndex`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`⚠️ [Binance Funding] HTTP ${res.status}`);
        return [];
      }

      const data = await res.json() as Array<{
        symbol: string;
        lastFundingRate: string;
        nextFundingTime: number;
      }>;

      const results: FundingRateScanResult[] = [];
      
      for (const item of data) {
        if (!TOP_TIER_SYMBOLS.has(item.symbol)) continue;

        const fundingRate = parseFloat(item.lastFundingRate);
        if (isNaN(fundingRate)) continue;

        const annualizedYield = fundingRate * 3 * 365 * 100;
        
        results.push({
          exchange: this.name,
          symbol: item.symbol,
          fundingRate,
          annualizedYield,
          nextFundingTime: new Date(item.nextFundingTime)
        });
      }

      return results;
    } catch (err) {
      console.error(`❌ [Binance Funding] Fetch failed:`, err instanceof Error ? err.message : err);
      return [];
    }
  }
}
