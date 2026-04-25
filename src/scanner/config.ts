export const SCANNER_CONFIG = {
  DEFAULT_TRADE_SIZE_USDT: 1000,
  FEE_BUFFER_PERCENT: 0.2,    // Exchange fees, bank charges, etc.
  SLIPPAGE_BUFFER_PERCENT: 0.3, // Price movement during trade
  MIN_SPREAD_PERCENT: 1.0,     // Only track spreads > 1%
  MIN_NET_PROFIT_NGN: 5000,    // Only track if net profit > 5000 NGN
  USE_REAL_BINANCE: true,      // Set to true to start fetching real data
  USE_REAL_BYBIT: true,        // Set to true to start fetching real data
};
