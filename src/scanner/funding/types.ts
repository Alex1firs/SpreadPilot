export interface FundingRateScanResult {
  exchange: string;
  symbol: string;
  fundingRate: number; // Raw 8-hour rate (e.g. 0.001 is 0.1%)
  annualizedYield: number; // APY% (e.g. 109.5 means 109.5%)
  nextFundingTime: Date;
}

export const TOP_TIER_SYMBOLS = new Set([
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'BNBUSDT', 'ADAUSDT',
  'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT', 'DOGEUSDT', 'SHIBUSDT',
  'PEPEUSDT', 'WIFUSDT', 'BONKUSDT', 'FLOKIUSDT', 'NEARUSDT', 'APTUSDT',
  'SUIUSDT', 'SEIUSDT', 'TIAUSDT', 'INJUSDT', 'RNDRUSDT', 'OPUSDT',
  'ARBUSDT', 'LDOUSDT', 'FETUSDT', 'STXUSDT', 'FILUSDT', 'ATOMUSDT',
  'MANTLEUSDT', 'TONUSDT', 'NOTUSDT', 'BOMEUSDT', 'MEMEUSDT', 'JUPUSDT'
]);
