import { SpotSymbol } from './types';

/** Symbols to monitor across exchanges */
export const SPOT_SYMBOLS: SpotSymbol[] = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  // Mid-cap
  'AVAXUSDT',
  'ADAUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'LTCUSDT',
  'MATICUSDT',
  'TRXUSDT',
  'ATOMUSDT',
  // High-volatility
  'SHIBUSDT',
  'PEPEUSDT',
  'WIFUSDT',
  'NOTUSDT',
  'BONKUSDT'
];

/** Default USDT trade size for opportunity calculations */
export const TRADE_SIZE_USDT = 1000;

/**
 * Taker fee per exchange (both sides charged).
 * Using standard maker fee: 0.05% per side (achievable with BNB/KCS discount
 * or moderate monthly volume on Binance/Bybit/KuCoin).
 * 0.0005 = 0.05%
 */
export const EXCHANGE_FEES: Record<string, number> = {
  Binance: 0.001,   // 0.1% taker (default; 0.05% with BNB discount)
  Bybit:   0.001,   // 0.1% taker
  KuCoin:  0.001,   // 0.1% taker (0.08% with KCS)
  OKX:     0.0008,  // 0.08% taker
  GateIo:  0.002,   // 0.2% taker
  MEXC:    0.001,   // 0.1% taker
};

/**
 * Estimated on-chain withdrawal fees.
 * These are in base-coin units and will be converted to USDT at scan time.
 * Source: Current network defaults (BTC Native, ETH ERC-20, SOL, BNB BEP-20, XRP).
 */
export const WITHDRAWAL_FEES_BASE: Record<SpotSymbol, number> = {
  BTCUSDT: 0.0002,
  ETHUSDT: 0.003,
  SOLUSDT: 0.01,
  BNBUSDT: 0.001,
  XRPUSDT: 0.25,
  AVAXUSDT: 0.01,
  ADAUSDT: 1.0,
  DOTUSDT: 0.1,
  LINKUSDT: 0.5,
  LTCUSDT: 0.001,
  MATICUSDT: 0.1,
  TRXUSDT: 1.0,
  ATOMUSDT: 0.005,
  SHIBUSDT: 100000,
  PEPEUSDT: 1000000,
  WIFUSDT: 5,
  NOTUSDT: 50,
  BONKUSDT: 50000,
};

/** Minimum net profit (USDT) required to surface an opportunity */
export const MIN_NET_PROFIT_USDT = 0.5;

/** Minimum net profit as percentage of trade size required */
export const MIN_NET_PROFIT_PERCENT = 0.05;

/** Minimum liquidity depth in USDT at best bid/ask */
export const MIN_LIQUIDITY_USDT = 500;

/** Seconds to wait before second confirmation check */
export const CONFIRMATION_WAIT_SECONDS = 2;

/** Set to true to fire Telegram alerts for real opportunities (leave false until formulas are validated) */
export const ENABLE_SPOT_ALERTS = false;
