import { MarketPrice, SpotOpportunity, SpotSymbol } from './types';
import {
  SPOT_SYMBOLS,
  TRADE_SIZE_USDT,
  EXCHANGE_FEES,
  WITHDRAWAL_FEES_BASE,
  MIN_NET_PROFIT_USDT,
  MIN_NET_PROFIT_PERCENT,
  MIN_LIQUIDITY_USDT,
} from './config';

/**
 * Groups a flat list of MarketPrice records by symbol.
 */
function groupBySymbol(prices: MarketPrice[]): Map<SpotSymbol, MarketPrice[]> {
  const map = new Map<SpotSymbol, MarketPrice[]>();
  for (const symbol of SPOT_SYMBOLS) {
    map.set(symbol, []);
  }
  for (const price of prices) {
    map.get(price.symbol)?.push(price);
  }
  return map;
}

/**
 * Calculates the withdrawal fee in USDT for a given symbol.
 * Uses the current buy (ask) price of the symbol for conversion.
 */
function getWithdrawalFeeUsdt(symbol: SpotSymbol, buyAskPrice: number): number {
  const feeInBase = WITHDRAWAL_FEES_BASE[symbol] ?? 0;
  return feeInBase * buyAskPrice;
}

/**
 * Core spot arbitrage opportunity calculation.
 *
 * Formula:
 *   baseAmount        = tradeSizeUsdt / buyAskPrice
 *   sellValueUsdt     = baseAmount * sellBidPrice
 *   grossProfitUsdt   = sellValueUsdt - tradeSizeUsdt
 *   tradingFeesUsdt   = tradeSizeUsdt * buyFee + sellValueUsdt * sellFee
 *   withdrawalFeeUsdt = WITHDRAWAL_FEES_BASE[symbol] * buyAskPrice
 *   netProfitUsdt     = grossProfitUsdt - tradingFeesUsdt - withdrawalFeeUsdt
 *   netProfitPercent  = (netProfitUsdt / tradeSizeUsdt) * 100
 */
function calculateSingleOpportunity(
  buyMarket: MarketPrice,
  sellMarket: MarketPrice,
  confirmedAt: Date,
): SpotOpportunity | null {
  const symbol = buyMarket.symbol;
  const buyFee = EXCHANGE_FEES[buyMarket.exchange] ?? 0.001;
  const sellFee = EXCHANGE_FEES[sellMarket.exchange] ?? 0.001;

  const buyAskPrice = buyMarket.askPrice;
  const sellBidPrice = sellMarket.bidPrice;

  // Step 1: We never buy at a price higher than we sell — basic sanity check
  if (buyAskPrice >= sellBidPrice) return null;

  const baseAmount = TRADE_SIZE_USDT / buyAskPrice;
  const sellValueUsdt = baseAmount * sellBidPrice;
  const grossProfitUsdt = sellValueUsdt - TRADE_SIZE_USDT;
  const tradingFeesUsdt = TRADE_SIZE_USDT * buyFee + sellValueUsdt * sellFee;
  const withdrawalFeeUsdt = getWithdrawalFeeUsdt(symbol, buyAskPrice);
  const netProfitUsdt = grossProfitUsdt - tradingFeesUsdt - withdrawalFeeUsdt;
  const netProfitPercent = (netProfitUsdt / TRADE_SIZE_USDT) * 100;

  // Liquidity: how much USDT we can trade at the best bid/ask levels
  const buyLiquidityUsdt = buyMarket.askQty * buyAskPrice;
  const sellLiquidityUsdt = sellMarket.bidQty * sellBidPrice;
  const liquidityUsdt = Math.min(buyLiquidityUsdt, sellLiquidityUsdt);

  // Threshold gate — ALL three must pass
  if (netProfitUsdt < MIN_NET_PROFIT_USDT) return null;
  if (netProfitPercent < MIN_NET_PROFIT_PERCENT) return null;
  if (liquidityUsdt < MIN_LIQUIDITY_USDT) return null;

  // Confidence score: higher spread → more confident (but also more suspicious)
  // We penalise opportunities where spread is unrealistically large (>2%)
  let confidenceScore = 90;
  if (netProfitPercent > 2) confidenceScore = 40;
  else if (netProfitPercent > 1) confidenceScore = 70;

  return {
    symbol,
    buyExchange: buyMarket.exchange,
    sellExchange: sellMarket.exchange,
    buyPrice: buyAskPrice,
    sellPrice: sellBidPrice,
    tradeSizeUsdt: TRADE_SIZE_USDT,
    grossProfitUsdt: Number(grossProfitUsdt.toFixed(4)),
    tradingFeesUsdt: Number(tradingFeesUsdt.toFixed(4)),
    withdrawalFeeUsdt: Number(withdrawalFeeUsdt.toFixed(4)),
    netProfitUsdt: Number(netProfitUsdt.toFixed(4)),
    netProfitPercent: Number(netProfitPercent.toFixed(4)),
    liquidityUsdt: Number(liquidityUsdt.toFixed(2)),
    confidenceScore,
    confirmedAt,
  };
}

/**
 * Main opportunity finder.
 * Compare the same symbol across all exchange pairs.
 * Only returns opportunities that passed the threshold gates.
 */
export function calculateSpotOpportunities(prices: MarketPrice[]): SpotOpportunity[] {
  const bySymbol = groupBySymbol(prices);
  const opportunities: SpotOpportunity[] = [];
  const now = new Date();

  for (const [, symbolPrices] of bySymbol) {
    if (symbolPrices.length < 2) continue; // Need at least 2 exchanges

    for (const buyMarket of symbolPrices) {
      for (const sellMarket of symbolPrices) {
        if (buyMarket.exchange === sellMarket.exchange) continue;

        const opp = calculateSingleOpportunity(buyMarket, sellMarket, now);
        if (opp) {
          opportunities.push(opp);
          console.log(
            `💰 [Opportunity] ${opp.symbol}: Buy on ${opp.buyExchange} @ ${opp.buyPrice} → Sell on ${opp.sellExchange} @ ${opp.sellPrice} | Net: $${opp.netProfitUsdt} (${opp.netProfitPercent}%)`
          );
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.netProfitUsdt - a.netProfitUsdt);
}
