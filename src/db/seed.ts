import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { opportunities, exchangePrices } from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.warn('⚠️ WARNING: Clearing development market-data tables (opportunities, exchange_prices)...');

  // Clear tables
  await db.delete(opportunities);
  await db.delete(exchangePrices);

  console.log('Tables cleared. Seeding exchange prices...');

  await db.insert(exchangePrices).values([
    { exchange: 'Binance', currency: 'USDT/NGN', buyPrice: '1145.50', sellPrice: '1160.00' },
    { exchange: 'OKX', currency: 'USDT/NGN', buyPrice: '1142.00', sellPrice: '1165.50' },
    { exchange: 'Bybit', currency: 'USDT/NGN', buyPrice: '1148.00', sellPrice: '1170.00' },
    { exchange: 'KuCoin', currency: 'USDT/NGN', buyPrice: '1135.00', sellPrice: '1155.00' },
  ]);

  console.log('Seeding USDT arbitrage opportunities...');

  await db.insert(opportunities).values([
    {
      buyExchange: 'KuCoin',
      sellExchange: 'Bybit',
      buyPrice: '1635.00',
      sellPrice: '1690.00',
      spread: '3.36',
      grossProfit: '55000',
      estimatedFees: '3270',
      slippageBuffer: '5070',
      netProfit: '46660',
      requiredCapitalNgn: '1635000',
      confidenceScore: '65',
      volumeUsdt: '1000',
      paymentMethod: 'Bank Transfer',
      riskLevel: 'High',
    },
    {
      buyExchange: 'OKX',
      sellExchange: 'Binance',
      buyPrice: '1642.00',
      sellPrice: '1670.00',
      spread: '1.71',
      grossProfit: '28000',
      estimatedFees: '3284',
      slippageBuffer: '5010',
      netProfit: '19706',
      requiredCapitalNgn: '1642000',
      confidenceScore: '92',
      volumeUsdt: '1000',
      paymentMethod: 'Kuda Bank',
      riskLevel: 'Low',
    },
    {
      buyExchange: 'Binance',
      sellExchange: 'Bybit',
      buyPrice: '1655.50',
      sellPrice: '1690.00',
      spread: '2.08',
      grossProfit: '34500',
      estimatedFees: '3311',
      slippageBuffer: '5070',
      netProfit: '26119',
      requiredCapitalNgn: '1655500',
      confidenceScore: '88',
      volumeUsdt: '1000',
      paymentMethod: 'Opay',
      riskLevel: 'Medium',
    }
  ]);

  console.log('✅ Seed completed successfully! Development data is ready.');
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
