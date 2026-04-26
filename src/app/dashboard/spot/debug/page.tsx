import { db } from '@/db';
import { spotScanRuns, spotMarketPrices, spotOpportunities, spotAlertLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatTimestamp(value: string | Date | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

export default async function SpotDebugPage() {
  const [lastScan, latestPrices, recentOpps, recentAlerts] = await Promise.all([
    db.select().from(spotScanRuns).orderBy(desc(spotScanRuns.startedAt)).limit(1).then((rows) => rows[0] ?? null),
    db.select().from(spotMarketPrices).orderBy(desc(spotMarketPrices.createdAt)).limit(48),
    db.select().from(spotOpportunities).orderBy(desc(spotOpportunities.confirmedAt)).limit(10),
    db.select().from(spotAlertLogs).orderBy(desc(spotAlertLogs.sentAt)).limit(10),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Spot Scanner Debug</h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Live proof that the spot scanner is fetching public exchange data, persisting prices to the database, recalculating opportunities, and logging alert decisions.
            </p>
          </div>
          <Link href="/dashboard/spot" className="text-sm text-emerald-400 hover:text-emerald-300">
            Back to Spot Dashboard
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Latest Scan Run</h2>
          {!lastScan ? (
            <p className="text-gray-400 text-sm">No spot scan run has been recorded yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Scan ID', lastScan.id],
                ['Status', lastScan.status],
                ['Started', formatTimestamp(lastScan.startedAt)],
                ['Completed', formatTimestamp(lastScan.completedAt)],
                ['Exchanges', String(lastScan.exchangesScanned)],
                ['Symbols', String(lastScan.symbolsScanned)],
                ['Prices fetched', String(lastScan.pricesFetched)],
                ['Candidates', String(lastScan.candidatesFound)],
                ['Confirmed opps', String(lastScan.opportunitiesFound)],
                ['Alerts sent', String(lastScan.alertsSent)],
                ['Error', lastScan.errorMessage ?? 'None'],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl bg-gray-950/70 border border-gray-800 p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-1">{label}</p>
                  <p className="text-sm text-white break-all">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Alert Decisions</h2>
          {recentAlerts.length === 0 ? (
            <p className="text-gray-400 text-sm">No Telegram alerts have been logged yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="rounded-2xl bg-gray-950/70 border border-gray-800 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-white">User {alert.userClerkId}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(alert.sentAt)}</p>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    <p>Opportunity ID: {alert.opportunityId}</p>
                    <p>Channel: {alert.channel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Raw Fetched Prices</h2>
            <p className="text-sm text-gray-400">The latest saved market snapshots from Binance, Bybit, KuCoin, OKX, Gate.io, and MEXC.</p>
          </div>
          <span className="text-xs text-gray-500">Showing {latestPrices.length} latest records</span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {latestPrices.map((price) => (
            <div key={`${price.id}-${price.exchange}-${price.symbol}`} className="rounded-3xl bg-gray-950/80 border border-gray-800 p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-sm text-gray-400">{price.exchange}</span>
                <span className="text-xs text-gray-500">{formatTimestamp(price.timestamp)}</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-white font-semibold">{price.symbol}</p>
                <p className="text-gray-400">Bid: ${Number(price.bidPrice).toFixed(4)} • Qty: {Number(price.bidQty).toFixed(2)}</p>
                <p className="text-gray-400">Ask: ${Number(price.askPrice).toFixed(4)} • Qty: {Number(price.askQty).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Confirmed Opportunities</h2>
        {recentOpps.length === 0 ? (
          <p className="text-gray-400 text-sm">No confirmed spot opportunities are currently saved.</p>
        ) : (
          <div className="grid gap-3">
            {recentOpps.map((opp) => (
              <div key={opp.id} className="rounded-3xl bg-gray-950/80 border border-gray-800 p-4">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <p className="text-sm text-white font-semibold">{opp.symbol}</p>
                  <span className="text-xs text-gray-500">{formatTimestamp(opp.confirmedAt)}</span>
                </div>
                <p className="text-sm text-gray-400">Buy {opp.buyExchange} @ ${Number(opp.buyPrice).toFixed(4)} → Sell {opp.sellExchange} @ ${Number(opp.sellPrice).toFixed(4)}</p>
                <p className="text-sm text-gray-400 mt-1">Net profit: ${Number(opp.netProfitUsdt).toFixed(2)} ({Number(opp.netProfitPercent).toFixed(3)}%)</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
