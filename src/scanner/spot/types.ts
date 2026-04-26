export type SpotSymbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | 'BNBUSDT' | 'XRPUSDT';

export interface MarketPrice {
  exchange: string;
  symbol: SpotSymbol;
  bidPrice: number;   // price at which the exchange buys (you can sell here)
  bidQty: number;     // available volume at bid
  askPrice: number;   // price at which you can buy
  askQty: number;     // available volume at ask
  timestamp: Date;
  source: 'real';
}

export interface SpotOpportunity {
  symbol: SpotSymbol;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;         // askPrice on buy exchange
  sellPrice: number;        // bidPrice on sell exchange
  tradeSizeUsdt: number;
  grossProfitUsdt: number;
  tradingFeesUsdt: number;
  withdrawalFeeUsdt: number;
  netProfitUsdt: number;
  netProfitPercent: number;
  liquidityUsdt: number;    // min of (bidQty * bidPrice) and (askQty * askPrice)
  confidenceScore: number;  // 0–100
  confirmedAt: Date;
}
