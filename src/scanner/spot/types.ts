export type SpotSymbol =
  // ── Large-cap (always scanned)
  | 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | 'BNBUSDT' | 'XRPUSDT'
  // ── Mid-cap (good liquidity, decent gaps)
  | 'AVAXUSDT' | 'ADAUSDT' | 'DOTUSDT' | 'LINKUSDT' | 'LTCUSDT'
  | 'MATICUSDT' | 'TRXUSDT' | 'ATOMUSDT'
  // ── High-volatility / meme (biggest arb gaps)
  | 'SHIBUSDT' | 'PEPEUSDT' | 'WIFUSDT' | 'NOTUSDT' | 'BONKUSDT';

export interface MarketPrice {
  exchange: string;
  symbol: SpotSymbol;
  bidPrice: number;   // best price at which you can sell
  bidQty:   number;   // available volume at bid (base coin)
  askPrice: number;   // best price at which you can buy
  askQty:   number;   // available volume at ask (base coin)
  timestamp: Date;
  source: 'real';
}

export interface SpotOpportunity {
  symbol: SpotSymbol;
  buyExchange:  string;
  sellExchange: string;
  buyPrice:  number;   // askPrice on buy exchange
  sellPrice: number;   // bidPrice on sell exchange
  tradeSizeUsdt:    number;
  grossProfitUsdt:  number;
  tradingFeesUsdt:  number;
  withdrawalFeeUsdt: number;
  netProfitUsdt:    number;
  netProfitPercent: number;
  liquidityUsdt:    number;
  confidenceScore:  number;  // 0–100
  confirmedAt: Date;
}
