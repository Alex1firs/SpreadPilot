import { pgTable, text, timestamp, numeric, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const exchangePrices = pgTable('exchange_prices', {
  id: uuid('id').defaultRandom().primaryKey(),
  exchange: text('exchange').notNull(), // 'Binance', 'Bybit', 'Remitano', etc.
  currency: text('currency').notNull(), // e.g., 'USDT/NGN'
  buyPrice: numeric('buy_price').notNull(),
  sellPrice: numeric('sell_price').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const opportunities = pgTable('opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),
  buyExchange: text('buy_exchange').notNull(),
  sellExchange: text('sell_exchange').notNull(),
  buyPrice: numeric('buy_price').notNull(),
  sellPrice: numeric('sell_price').notNull(),
  spread: numeric('spread').notNull(), 
  grossProfit: numeric('gross_profit').notNull().default('0'),
  estimatedFees: numeric('estimated_fees').notNull().default('0'),
  slippageBuffer: numeric('slippage_buffer').notNull().default('0'),
  netProfit: numeric('net_profit').notNull().default('0'),
  requiredCapitalNgn: numeric('required_capital_ngn').notNull().default('0'),
  confidenceScore: numeric('confidence_score').notNull().default('50'), // 0-100
  volumeUsdt: numeric('volume_usdt').notNull().default('1000'),
  paymentMethod: text('payment_method').notNull().default('Bank Transfer'),
  riskLevel: text('risk_level').notNull(), // 'Low', 'Medium', 'High'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

export const tradeJournal = pgTable('trade_journal', {
  id: uuid('id').defaultRandom().primaryKey(),
  userClerkId: text('user_clerk_id').notNull(),
  buyExchange: text('buy_exchange').notNull(),
  sellExchange: text('sell_exchange').notNull(),
  volumeUsdt: numeric('volume_usdt').notNull(),
  buyPrice: numeric('buy_price').notNull(),
  sellPrice: numeric('sell_price').notNull(),
  totalCostNgn: numeric('total_cost_ngn').notNull(),
  totalReturnNgn: numeric('total_return_ngn').notNull(),
  netProfitNgn: numeric('net_profit_ngn').notNull(),
  status: text('status').notNull().default('Completed'), // 'Completed', 'Pending'
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export const userGoals = pgTable('user_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userClerkId: text('user_clerk_id').notNull().unique(),
  dailyProfitTarget: numeric('daily_profit_target').default('10000').notNull(),
  weeklyProfitTarget: numeric('weekly_profit_target').default('50000').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const alertSettings = pgTable('alert_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userClerkId: text('user_clerk_id').notNull().unique(), // Direct reference
  telegramChatId: text('telegram_chat_id'),
  minSpread: numeric('min_spread').default('1.5').notNull(), 
  minProfit: numeric('min_profit').default('1000').notNull(),
  maxRiskLevel: text('max_risk_level').default('Medium').notNull(),
  alertsEnabled: boolean('alerts_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const alertLogs = pgTable('alert_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userClerkId: text('user_clerk_id').notNull(),
  opportunityId: uuid('opportunity_id').references(() => opportunities.id).notNull(),
  channel: text('channel').default('telegram').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

export const scanRuns = pgTable('scan_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  exchangesScanned: numeric('exchanges_scanned').notNull().default('0'),
  opportunitiesFound: numeric('opportunities_found').notNull().default('0'),
  bestSpread: numeric('best_spread').notNull().default('0'),
  bestNetProfit: numeric('best_net_profit').notNull().default('0'),
  status: text('status').notNull().default('pending'), // 'pending', 'completed', 'failed'
});

export const opportunitySnapshots = pgTable('opportunity_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  scanRunId: uuid('scan_run_id').references(() => scanRuns.id).notNull(),
  buyExchange: text('buy_exchange').notNull(),
  sellExchange: text('sell_exchange').notNull(),
  buyPrice: numeric('buy_price').notNull(),
  sellPrice: numeric('sell_price').notNull(),
  spread: numeric('spread').notNull(),
  grossProfit: numeric('gross_profit').notNull(),
  estimatedFees: numeric('estimated_fees').notNull(),
  slippageBuffer: numeric('slippage_buffer').notNull(),
  netProfit: numeric('net_profit').notNull(),
  requiredCapitalNgn: numeric('required_capital_ngn').notNull(),
  confidenceScore: numeric('confidence_score').notNull(),
  riskLevel: text('risk_level').notNull(),
  paymentMethod: text('payment_method').notNull().default('Bank Transfer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userClerkId: text('user_clerk_id').notNull().unique(),
  plan: text('plan').notNull().default('Free'), // 'Free', 'Pro', 'Premium'
  status: text('status').notNull().default('active'), // 'active', 'past_due', 'canceled'
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date'),
  paystackCustomerId: text('paystack_customer_id'),
  paystackSubscriptionCode: text('paystack_subscription_code'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const spotMarketPrices = pgTable('spot_market_prices', {
  id: uuid('id').defaultRandom().primaryKey(),
  exchange: text('exchange').notNull(),
  symbol: text('symbol').notNull(),
  bidPrice: numeric('bid_price').notNull(),
  bidQty: numeric('bid_qty').notNull(),
  askPrice: numeric('ask_price').notNull(),
  askQty: numeric('ask_qty').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const spotOpportunities = pgTable('spot_opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),
  symbol: text('symbol').notNull(),
  buyExchange: text('buy_exchange').notNull(),
  sellExchange: text('sell_exchange').notNull(),
  buyPrice: numeric('buy_price').notNull(),
  sellPrice: numeric('sell_price').notNull(),
  tradeSizeUsdt: numeric('trade_size_usdt').notNull(),
  grossProfitUsdt: numeric('gross_profit_usdt').notNull(),
  tradingFeesUsdt: numeric('trading_fees_usdt').notNull(),
  withdrawalFeeUsdt: numeric('withdrawal_fee_usdt').notNull(),
  netProfitUsdt: numeric('net_profit_usdt').notNull(),
  netProfitPercent: numeric('net_profit_percent').notNull(),
  liquidityUsdt: numeric('liquidity_usdt').notNull(),
  confidenceScore: numeric('confidence_score').notNull().default('0'),
  status: text('status').notNull().default('active'),
  confirmedAt: timestamp('confirmed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const spotScanRuns = pgTable('spot_scan_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  exchangesScanned: numeric('exchanges_scanned').notNull().default('0'),
  symbolsScanned: numeric('symbols_scanned').notNull().default('0'),
  opportunitiesFound: numeric('opportunities_found').notNull().default('0'),
  status: text('status').notNull().default('pending'),
  errorMessage: text('error_message'),
});

export const ngnP2pSpreads = pgTable('ngn_p2p_spreads', {
  id: uuid('id').defaultRandom().primaryKey(),
  p2pBuyRate: numeric('p2p_buy_rate').notNull(),
  p2pSellRate: numeric('p2p_sell_rate').notNull(),
  spotRateNgn: numeric('spot_rate_ngn').notNull(),
  spreadPercent: numeric('spread_percent').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const triangularOpportunities = pgTable('triangular_opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),
  exchange: text('exchange').notNull(),
  trianglePath: text('triangle_path').notNull(),
  step1Detail: text('step1_detail').notNull(),
  step2Detail: text('step2_detail').notNull(),
  step3Detail: text('step3_detail').notNull(),
  grossProfitPercent: numeric('gross_profit_percent').notNull(),
  netProfitPercent: numeric('net_profit_percent').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const fundingRates = pgTable('funding_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  exchange: text('exchange').notNull(),
  symbol: text('symbol').notNull(),
  fundingRate: numeric('funding_rate').notNull(),
  annualizedYield: numeric('annualized_yield').notNull(),
  nextFundingTime: timestamp('next_funding_time').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
