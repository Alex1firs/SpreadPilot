import { LineChart, AlertTriangle } from 'lucide-react';
import { db } from '@/db';
import { ngnP2pSpreads } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, canAccessProFeatures } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default async function NgnP2pPage() {
  const { userId } = await auth();
  const sub = await getUserSubscription(userId || '');
  const isPro = canAccessProFeatures(sub.plan);

  const spreads = await db.select()
    .from(ngnP2pSpreads)
    .orderBy(desc(ngnP2pSpreads.timestamp))
    .limit(50); // Get latest 50 records

  const latestSpread = spreads.length > 0 ? spreads[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <LineChart className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-white">NGN P2P Spread Monitor</h1>
          <span className="text-[10px] font-bold bg-orange-500/20 text-orange-500 border border-orange-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Live Rates
          </span>
        </div>
        <p className="text-gray-400">
          Monitor the gap between Nigerian P2P Naira prices and the global USD/NGN official exchange rate.
        </p>
      </div>

      {!isPro && (
        <div className="flex items-start gap-3 p-4 bg-orange-950/30 border border-orange-500/20 rounded-xl text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-orange-400 font-medium">Pro Subscription Required for Full History</p>
            <p className="text-orange-500/60 text-xs mt-0.5">
              You are viewing limited history. Upgrade to Pro for full historical tracking, automated execution features (upcoming), and Telegram alerts for new NGN opportunities.
            </p>
          </div>
        </div>
      )}

      {/* Latest Status Overview Component */}
      {latestSpread && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <h2 className="text-lg font-semibold text-white mb-6 tracking-tight">Current Market Edge</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {/* Spot Rate */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Official Spot Rate</span>
              <div className="text-3xl font-mono text-white">
                ₦{Number(latestSpread.spotRateNgn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* P2P Buy */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">P2P Buy Rate (You Pay)</span>
              <div className="text-3xl font-mono text-indigo-400">
                ₦{Number(latestSpread.p2pBuyRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* P2P Sell */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">P2P Sell Rate (You Get)</span>
              <div className="text-3xl font-mono text-pink-400">
                ₦{Number(latestSpread.p2pSellRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Gap Percent */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Arbitrage Gap</span>
              <div className={`text-4xl font-mono font-black ${Number(latestSpread.spreadPercent) > 2 ? 'text-emerald-500' : 'text-gray-400'}`}>
                {Number(latestSpread.spreadPercent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </div>
            </div>
          </div>
          
          {/* Action Recommendation */}
          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
             <div>
                <p className="text-sm font-medium text-white">Recommendation:</p>
                <p className="text-sm text-gray-400">
                   {Number(latestSpread.spreadPercent) > 2.0 
                      ? "💡 The P2P Buy rate is significantly lower than the spot rate. This is an opportunity to BUY USDT on P2P." 
                      : Number(latestSpread.spreadPercent) < -1.0 
                      ? "💡 The P2P Sell rate is much higher than the spot market value. This is a premium opportunity to SELL your USDT."
                      : "⚖️ The P2P market is efficiently priced with the spot value right now. No major arbitrage apparent."
                   }
                </p>
             </div>
             
             <div className="text-[11px] text-gray-500 w-full md:w-auto text-right font-medium">
               Last updated: {new Date(latestSpread.timestamp).toLocaleString()}
             </div>
          </div>
        </div>
      )}

      {/* Historical Logs */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 tracking-tight mt-8">Recent Scan History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-900 font-bold tracking-widest">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Time</th>
                <th className="px-4 py-3">Spot Rate</th>
                <th className="px-4 py-3">P2P Buy</th>
                <th className="px-4 py-3">P2P Sell</th>
                <th className="px-4 py-3 rounded-r-lg">Gap (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(isPro ? spreads : spreads.slice(0, 3)).map((record) => (
                <tr key={record.id} className="hover:bg-gray-900/50">
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-200">
                    ₦{Number(record.spotRateNgn).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-400">
                    ₦{Number(record.p2pBuyRate).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-pink-400">
                    ₦{Number(record.p2pSellRate).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      Number(record.spreadPercent) > 2 ? 'bg-emerald-500/20 text-emerald-400' :
                      Number(record.spreadPercent) < -1 ? 'bg-pink-500/20 text-pink-400' : 'text-gray-400'
                    }`}>
                      {Number(record.spreadPercent) > 0 ? '+' : ''}{Number(record.spreadPercent).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!isPro && spreads.length > 3 && (
            <div className="p-4 text-center border border-gray-800 border-t-0 rounded-b-xl bg-gray-900/20">
               <span className="text-xs text-gray-500">Subscribe to Pro to view the full history and receive alerts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
