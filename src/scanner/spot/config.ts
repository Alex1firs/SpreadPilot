import { SpotSymbol } from './types';

/** Symbols to monitor across exchanges */
export const SPOT_SYMBOLS: SpotSymbol[] = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
];

/** Default USDT trade size for opportunity calculations */
export const TRADE_SIZE_USDT = 1000;

/**
 * Taker fee per exchange (both sides charged).
 * 0.001 = 0.1%
 */
export const EXCHANGE_FEES: Record<string, number> = {
  Binance: 0.001,
  Bybit: 0.001,
  KuCoin: 0.001,
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
};

/** Minimum net profit (USDT) required to surface an opportunity */
export const MIN_NET_PROFIT_USDT = 5;

/** Minimum net profit as percentage of trade size required */
export const MIN_NET_PROFIT_PERCENT = 0.3;

/** Minimum liquidity depth in USDT at best bid/ask */
export const MIN_LIQUIDITY_USDT = 1000;

/** Seconds to wait before second confirmation check */
export const CONFIRMATION_WAIT_SECONDS = 2;

/** Set to true to fire Telegram alerts for real opportunities (leave false until formulas are validated) */
export const ENABLE_SPOT_ALERTS = false;
