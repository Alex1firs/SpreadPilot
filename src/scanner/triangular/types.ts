export type TradeAction = 'BUY' | 'SELL';

export interface TriangleLeg {
  symbol: string;         // e.g., 'BTCUSDT'
  action: TradeAction;    // 'BUY' to buy base with quote, 'SELL' to sell base for quote
}

export interface TrianglePath {
  id: string;             // e.g., 'USDT-BTC-ETH-USDT'
  leg1: TriangleLeg;
  leg2: TriangleLeg;
  leg3: TriangleLeg;
}

export interface TriangularOpportunity {
  exchange: string;
  trianglePath: string;
  step1Detail: string;
  step2Detail: string;
  step3Detail: string;
  grossProfitPercent: number;
  netProfitPercent: number;
  confidenceScore: number;
  timestamp: Date;
}

// Interface for normalized universal ticker data returned by all exchanges
export interface OrderbookSnapshot {
  symbol: string;        // 'BTCUSDT'
  bidPrice: number;
  askPrice: number;
}
