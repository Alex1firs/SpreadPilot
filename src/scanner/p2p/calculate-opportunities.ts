import { ArbitrageOpportunity, P2PPrice } from "./types";
import { SCANNER_CONFIG } from "./config";

export function calculateOpportunities(prices: P2PPrice[]): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  const volumeUsdt = SCANNER_CONFIG.DEFAULT_TRADE_SIZE_USDT;

  for (const buyTarget of prices) {
    for (const sellTarget of prices) {
      if (buyTarget.exchange === sellTarget.exchange) continue;

      const purchaseCost = buyTarget.buyPrice * volumeUsdt;
      const saleRevenue = sellTarget.sellPrice * volumeUsdt;
      
      const grossProfit = saleRevenue - purchaseCost;
      const spread = (grossProfit / purchaseCost) * 100;

      // Realistic Adjustments
      const estimatedFees = purchaseCost * (SCANNER_CONFIG.FEE_BUFFER_PERCENT / 100);
      const slippageBuffer = saleRevenue * (SCANNER_CONFIG.SLIPPAGE_BUFFER_PERCENT / 100);
      const netProfit = grossProfit - estimatedFees - slippageBuffer;

      // Filter by configuration
      if (spread >= SCANNER_CONFIG.MIN_SPREAD_PERCENT && netProfit >= SCANNER_CONFIG.MIN_NET_PROFIT_NGN) {
        
        // Confidence Score Logic (Simulated)
        // High spread usually means lower confidence due to likely fake ads or extreme volatility
        let confidenceScore = 95;
        if (spread > 5) confidenceScore = 40;
        else if (spread > 3) confidenceScore = 70;

        // Risk Logic
        let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
        if (spread > 5 || confidenceScore < 50) riskLevel = 'High';
        else if (spread > 3) riskLevel = 'Medium';

        opportunities.push({
          buyExchange: buyTarget.exchange,
          sellExchange: sellTarget.exchange,
          buyPrice: buyTarget.buyPrice,
          sellPrice: sellTarget.sellPrice,
          spread: Number(spread.toFixed(2)),
          grossProfit: Number(grossProfit.toFixed(0)),
          estimatedFees: Number(estimatedFees.toFixed(0)),
          slippageBuffer: Number(slippageBuffer.toFixed(0)),
          netProfit: Number(netProfit.toFixed(0)),
          requiredCapitalNgn: Number(purchaseCost.toFixed(0)),
          confidenceScore,
          volumeUsdt,
          riskLevel
        });
      }
    }
  }

  return opportunities.sort((a, b) => b.netProfit - a.netProfit);
}
