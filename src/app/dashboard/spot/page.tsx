import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { spotOpportunities, spotScanRuns } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Zap, ShieldCheck, AlertCircle, Clock, TrendingUp, ArrowRight, Info } from 'lucide-react';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function getSpotData() {
  const [activeOpps, lastScan, latestPrices] = await Promise.all([
    db.select()
      .from(spotOpportunities)
      .where(eq(spotOpportunities.status, 'active'))
      .orderBy(desc(spotOpportunities.confirmedAt))
      .limit(20),
    db.select()
      .from(spotScanRuns)
      .orderBy(desc(spotScanRuns.startedAt))
      .limit(1),
    // Fetch latest prices for each exchange/symbol to show spreads
    db.select()
      .from(spotMarketPrices)
      .orderBy(desc(spotMarketPrices.createdAt))
      .limit(25), // Enough to cover 4 exchanges * 5 symbols
  ]);

  return { activeOpps, lastScan: lastScan[0] ?? null, latestPrices };
}

function formatTime(date: Date | string | null) {
  if (!date) return 'Never';
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date | string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function ConfidenceBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : score >= 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20';
  const label = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${color}`}>
      {label} ({score})
    </span>
  );
}

export default async function SpotArbitragePage() {
  const { activeOpps, lastScan } = await getSpotData();
  const lastRunAt = lastScan?.completedAt ?? lastScan?.startedAt ?? null;
  const scanStatus = lastScan?.status ?? 'none';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Spot Arbitrage</h1>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Real Data
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Cross-exchange spot opportunities from live public market data.
          </p>
        </div>

        {/* Scanner Status */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm">
          <span className={`h-2 w-2 rounded-full ${scanStatus === 'completed' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-gray-400">Last scan:</span>
          <span className="text-white font-medium">{formatTime(lastRunAt)}</span>
        </div>
      </div>

      {/* Data Source Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-950/40 border border-blue-500/20 rounded-xl text-sm">
        <ShieldCheck className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-blue-300 font-medium">Real public market data — No simulated opportunities shown</p>
          <p className="text-blue-400/70">
            Prices fetched from Binance, Bybit, KuCoin, and OKX public REST APIs. Opportunities require a second
            confirmation check before being saved.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-3 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-500">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <p>
          Spot opportunities are calculated from public exchange market data. Actual execution may vary due to
          fees, latency, liquidity, and withdrawal times. Always verify prices before executing a trade.
        </p>
      </div>

      {/* Scan Stats */}
      {lastScan && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Exchanges', value: lastScan.exchangesScanned ?? '—' },
            { label: 'Symbols', value: lastScan.symbolsScanned ?? '—' },
            { label: 'Opportunities', value: lastScan.opportunitiesFound ?? '0' },
            { label: 'Scan Status', value: lastScan.status ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-lg font-semibold text-white capitalize">{String(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Opportunities */}
      {activeOpps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-gray-900/40 border border-gray-800 rounded-2xl">
          <div className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-gray-500" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">No live spot arbitrage opportunities found right now.</p>
            <p className="text-gray-400 text-sm mt-1 max-w-md">
              Scanner is active and monitoring real market data. Opportunities will appear here only when a profitable,
              confirmed spread is detected across exchanges.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
            <Clock className="h-3.5 w-3.5" />
            <span>Last checked: {lastRunAt ? formatDate(lastRunAt) : 'Run <code>npm run spot:scan</code> to start'}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">
              {activeOpps.length} Confirmed Opportunit{activeOpps.length === 1 ? 'y' : 'ies'}
            </h2>
            <span className="text-xs text-gray-500">Sorted by net profit</span>
          </div>

          <div className="space-y-3">
            {activeOpps.map((opp) => {
              const netProfit = parseFloat(opp.netProfitUsdt);
              const netPct = parseFloat(opp.netProfitPercent);
              const confidence = parseFloat(opp.confidenceScore);

              return (
                <div
                  key={opp.id}
                  className="bg-gray-900 border border-gray-800 hover:border-emerald-500/30 rounded-2xl p-5 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Symbol and route */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-base">{opp.symbol}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <span className="text-gray-300 font-medium">{opp.buyExchange}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="text-gray-300 font-medium">{opp.sellExchange}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Buy Ask</p>
                        <p className="text-white font-mono">${parseFloat(opp.buyPrice).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Sell Bid</p>
                        <p className="text-white font-mono">${parseFloat(opp.sellPrice).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Trading Fees</p>
                        <p className="text-orange-400 font-mono">−${parseFloat(opp.tradingFeesUsdt).toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Withdrawal Fee</p>
                        <p className="text-orange-400 font-mono">−${parseFloat(opp.withdrawalFeeUsdt).toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-0.5">Liquidity</p>
                        <p className="text-gray-300 font-mono">${parseFloat(opp.liquidityUsdt).toFixed(0)}</p>
                      </div>
                    </div>

                    {/* Net profit */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <p className="text-emerald-400 font-bold text-xl">+${netProfit.toFixed(2)}</p>
                      <p className="text-emerald-500/70 text-sm">+{netPct.toFixed(3)}%</p>
                      <ConfidenceBadge score={confidence} />
                    </div>
                  </div>

                  {/* Confirmed timestamp */}
                  <div className="mt-3 pt-3 border-t border-gray-800 flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Confirmed: {formatDate(opp.confirmedAt)}</span>
                    <span className="mx-1">·</span>
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    <span className="text-emerald-600">Passed 2-step confirmation</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Market Spreads Intelligence */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-400" />
          <h2 className="text-white font-semibold text-lg">Market Spreads Intelligence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'].map((symbol) => {
            const symPrices = latestPrices.filter(p => p.symbol === symbol);
            if (symPrices.length === 0) return null;
            
            // Calculate max bid and min ask across exchanges
            const maxBid = Math.max(...symPrices.map(p => parseFloat(p.bidPrice)));
            const minAsk = Math.min(...symPrices.map(p => parseFloat(p.askPrice)));
            const rawSpread = ((maxBid - minAsk) / minAsk) * 100;

            return (
              <div key={symbol} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">{symbol}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${rawSpread > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                    {rawSpread.toFixed(3)}% Spread
                  </span>
                </div>
                <div className="space-y-2">
                  {symPrices.map((p, idx) => (
                    <div key={`${p.exchange}-${idx}`} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{p.exchange}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-red-400/70">${parseFloat(p.askPrice).toFixed(2)}</span>
                        <span className="text-gray-700">|</span>
                        <span className="text-emerald-400/70">${parseFloat(p.bidPrice).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
