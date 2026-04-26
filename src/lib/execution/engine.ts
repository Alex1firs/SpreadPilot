import ccxt from 'ccxt';
import { db } from '@/db';
import { userApiKeys, autoPilotSettings, autoTrades } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '@/lib/crypto';

export interface ExecutionLeg {
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
}

export interface ExecutionRequest {
  strategy: 'Spot' | 'Triangular';
  exchange: string;
  legs: ExecutionLeg[];
  expectedProfitPercent: number;
}

export async function executeForAllUsers(request: ExecutionRequest) {
  console.log(`📡 [Execution Engine] Processing ${request.strategy} opportunity on ${request.exchange}`);

  // 1. Get eligible users (AutoPilot ON + Active API Key for this exchange)
  const eligibleUsers = await db.select({
    clerkId: autoPilotSettings.userClerkId,
    maxSize: autoPilotSettings.maxTradeSizeUsdt,
  })
  .from(autoPilotSettings)
  .innerJoin(userApiKeys, eq(autoPilotSettings.userClerkId, userApiKeys.userClerkId))
  .where(and(
    eq(autoPilotSettings.isEnabled, true),
    eq(userApiKeys.exchange, request.exchange),
    eq(userApiKeys.isActive, true)
  ));

  if (eligibleUsers.length === 0) {
    return;
  }

  console.log(`🎯 [Execution Engine] Found ${eligibleUsers.length} users for execution.`);

  // For MVP, execute for users sequentially to avoid hitting exchange rate limits too hard simultaneously
  for (const user of eligibleUsers) {
    try {
      await executeForUser(user.clerkId, parseFloat(user.maxSize), request);
    } catch (err) {
      console.error(`❌ [Execution Engine] Failed execution for user ${user.clerkId}:`, err);
    }
  }
}

async function executeForUser(clerkId: string, maxTradeSize: number, request: ExecutionRequest) {
  // 1. Fetch encrypted keys
  const keys = await db.select()
    .from(userApiKeys)
    .where(and(
      eq(userApiKeys.userClerkId, clerkId),
      eq(userApiKeys.exchange, request.exchange)
    ))
    .limit(1);

  if (keys.length === 0) return;

  const k = keys[0];
  const apiKey = decrypt(k.apiKey);
  const secret = decrypt(k.apiSecret);
  const password = k.passphrase ? decrypt(k.passphrase) : undefined;

  // 2. Initialize CCXT
  // @ts-ignore
  const exchangeClass = ccxt[request.exchange.toLowerCase()];
  if (!exchangeClass) return;

  const client = new exchangeClass({
    apiKey,
    secret,
    password,
    enableRateLimit: true,
  });

  console.log(`🚀 [Execution Engine] Starting ${request.legs.length}-leg execution for user ${clerkId}`);

  let currentAmount = maxTradeSize;

  for (const leg of request.legs) {
    try {
      // Calculate quantity
      // If we are buying base with quote (currentAmount is quote), qty = amount / price
      // If we are selling base for quote (currentAmount is base), qty = currentAmount
      
      const quantity = leg.side === 'buy' ? currentAmount / leg.price : currentAmount;
      
      console.log(`⚡ [Execution] ${leg.side.toUpperCase()} ${leg.symbol} | Qty: ${quantity.toFixed(6)}`);

      const order = await client.createMarketOrder(leg.symbol, leg.side, quantity);

      // Update currentAmount for next leg
      // If buy, new amount is in base currency (the quantity we just bought)
      // If sell, new amount is in quote currency (quantity * price)
      currentAmount = leg.side === 'buy' ? quantity : quantity * leg.price;

      // Log success
      await db.insert(autoTrades).values({
        userClerkId: clerkId,
        strategy: request.strategy,
        exchange: request.exchange,
        symbol: leg.symbol,
        side: leg.side.toUpperCase(),
        quantity: quantity.toString(),
        price: leg.price.toString(),
        status: 'Completed',
        orderId: order.id,
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'CCXT error';
      console.error(`🛑 [Execution] Leg Failure: ${errorMsg}`);
      
      await db.insert(autoTrades).values({
        userClerkId: clerkId,
        strategy: request.strategy,
        exchange: request.exchange,
        symbol: leg.symbol,
        side: leg.side.toUpperCase(),
        quantity: '0',
        price: leg.price.toString(),
        status: 'Failed',
        errorMessage: errorMsg,
      });

      // Break the loop if a leg fails to avoid getting stuck with partials
      break; 
    }
  }
}
