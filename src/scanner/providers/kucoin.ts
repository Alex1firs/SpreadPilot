import { P2PPrice, PriceProvider } from "../types";

export class KucoinProvider implements PriceProvider {
  name = "KuCoin";

  async fetchPrices(): Promise<P2PPrice> {
    const basePrice = 1630;
    const volatility = Math.random() * 20 - 10; // More volatility for Kucoin simulation
    
    return {
      exchange: this.name,
      currency: "USDT/NGN",
      buyPrice: basePrice + volatility,
      sellPrice: (basePrice + volatility) * 0.992,
      lastUpdated: new Date(),
    };
  }
}
