import { P2PPrice, PriceProvider } from "../types";

export class OkxProvider implements PriceProvider {
  name = "OKX";

  async fetchPrices(): Promise<P2PPrice> {
    const basePrice = 1645;
    const volatility = Math.random() * 8 - 4;
    
    return {
      exchange: this.name,
      currency: "USDT/NGN",
      buyPrice: basePrice + volatility,
      sellPrice: (basePrice + volatility) * 0.994,
      lastUpdated: new Date(),
    };
  }
}
