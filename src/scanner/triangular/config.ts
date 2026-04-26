import { TrianglePath } from './types';

// Approximate fee per leg (0.1% standard taker fee for Binance, Bybit, OKX for mid/low tiers)
export const TRIANGLE_FEE_RATE = 0.001; 

// The total multiplier to retain from the raw output. 
// E.g., if fee is 0.1%, we retain 0.999 per transaction. 
// 3 transactions = 0.999 * 0.999 * 0.999 = 0.997002999
export const TOTAL_FEE_MULTIPLIER = Math.pow(1 - TRIANGLE_FEE_RATE, 3);

// Thresholds
export const MIN_TRIANGLE_PROFIT_PERCENT = 0.1; // Only record/alert if we clear 0.1% *after* fees.
export const TRIANGLE_WAIT_SECONDS = 1; // Wait before second confirmation scan (very aggressive because triangles close fast)

export const TRIANGLE_PATHS: TrianglePath[] = [
  // Loop 1: USDT -> BTC -> ETH -> USDT
  {
    id: 'USDT-BTC-ETH-USDT',
    leg1: { symbol: 'BTCUSDT', action: 'BUY' },  // Buy BTC with USDT
    leg2: { symbol: 'ETHBTC', action: 'BUY' },   // Buy ETH with BTC
    leg3: { symbol: 'ETHUSDT', action: 'SELL' }, // Sell ETH for USDT
  },
  // Loop 2: USDT -> ETH -> BTC -> USDT
  {
    id: 'USDT-ETH-BTC-USDT',
    leg1: { symbol: 'ETHUSDT', action: 'BUY' },  // Buy ETH with USDT
    leg2: { symbol: 'ETHBTC', action: 'SELL' },  // Sell ETH for BTC
    leg3: { symbol: 'BTCUSDT', action: 'SELL' }, // Sell BTC for USDT
  },
  // Loop 3: USDT -> BTC -> SOL -> USDT
  {
    id: 'USDT-BTC-SOL-USDT',
    leg1: { symbol: 'BTCUSDT', action: 'BUY' },
    leg2: { symbol: 'SOLBTC', action: 'BUY' },
    leg3: { symbol: 'SOLUSDT', action: 'SELL' },
  },
  // Loop 4: USDT -> SOL -> BTC -> USDT
  {
    id: 'USDT-SOL-BTC-USDT',
    leg1: { symbol: 'SOLUSDT', action: 'BUY' },
    leg2: { symbol: 'SOLBTC', action: 'SELL' },
    leg3: { symbol: 'BTCUSDT', action: 'SELL' },
  },
  // Loop 5: USDT -> BTC -> BNB -> USDT
  {
    id: 'USDT-BTC-BNB-USDT',
    leg1: { symbol: 'BTCUSDT', action: 'BUY' },
    leg2: { symbol: 'BNBBTC', action: 'BUY' },
    leg3: { symbol: 'BNBUSDT', action: 'SELL' },
  },
  // Loop 6: USDT -> BNB -> BTC -> USDT
  {
    id: 'USDT-BNB-BTC-USDT',
    leg1: { symbol: 'BNBUSDT', action: 'BUY' },
    leg2: { symbol: 'BNBBTC', action: 'SELL' },
    leg3: { symbol: 'BTCUSDT', action: 'SELL' },
  },
  // Loop 7: USDT -> BTC -> XRP -> USDT
  {
    id: 'USDT-BTC-XRP-USDT',
    leg1: { symbol: 'BTCUSDT', action: 'BUY' },
    leg2: { symbol: 'XRPBTC', action: 'BUY' },
    leg3: { symbol: 'XRPUSDT', action: 'SELL' },
  },
  // Loop 8: USDT -> XRP -> BTC -> USDT
  {
    id: 'USDT-XRP-BTC-USDT',
    leg1: { symbol: 'XRPUSDT', action: 'BUY' },
    leg2: { symbol: 'XRPBTC', action: 'SELL' },
    leg3: { symbol: 'BTCUSDT', action: 'SELL' },
  },
  // Loop 9: USDT -> ETH -> BNB -> USDT
  {
    id: 'USDT-ETH-BNB-USDT',
    leg1: { symbol: 'ETHUSDT', action: 'BUY' },
    leg2: { symbol: 'BNBETH', action: 'BUY' },
    leg3: { symbol: 'BNBUSDT', action: 'SELL' },
  },
  // Loop 10: USDT -> BNB -> ETH -> USDT
  {
    id: 'USDT-BNB-ETH-USDT',
    leg1: { symbol: 'BNBUSDT', action: 'BUY' },
    leg2: { symbol: 'BNBETH', action: 'SELL' },
    leg3: { symbol: 'ETHUSDT', action: 'SELL' },
  }
];
