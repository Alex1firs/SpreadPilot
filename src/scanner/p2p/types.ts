export interface P2PPrice {
  exchange: string;
  currency: string; // e.g. USDT/NGN
  buyPrice: number;
  sellPrice: number;
  lastUpdated: Date;
}

export interface ArbitrageOpportunity {
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  grossProfit: number;
  estimatedFees: number;
  slippageBuffer: number;
  netProfit: number;
  requiredCapitalNgn: number;
  confidenceScore: number;
  volumeUsdt: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface PriceProvider {
  name: string;
  fetchPrices(): Promise<P2PPrice>;
}
