import { db } from '@/db';
import { scanRuns } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Clock, CheckCircle2, XCircle, TrendingUp, DollarSign, Lock } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, canAccessProFeatures } from '@/lib/subscription';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const { userId } = await auth();
  const sub = await getUserSubscription(userId || '');
  const isPro = canAccessProFeatures(sub.plan);

  const limit = isPro ? 50 : 3;

  const scans = await db.select()
    .from(scanRuns)
    .orderBy(desc(scanRuns.startedAt))
    .limit(limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Scan History</h1>
        <p className="text-gray-400">Past scanner runs and their discovered opportunities.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950/50 border-b border-gray-800">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Time</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Exchanges</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Opportunities</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Best Spread</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Best Net Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="text-sm text-white font-medium">
                    {new Date(scan.startedAt).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {new Date(scan.startedAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {scan.status === 'completed' ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </div>
                  ) : scan.status === 'pending' ? (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase">
                      <Clock className="w-3 h-3 animate-pulse" /> Running
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase">
                      <XCircle className="w-3 h-3" /> Failed
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                   <span className="text-gray-300 text-sm font-medium">{scan.exchangesScanned}</span>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className={`text-sm font-bold ${Number(scan.opportunitiesFound) > 0 ? 'text-emerald-400' : 'text-gray-600'}`}>
                     {scan.opportunitiesFound}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold text-sm">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {Number(scan.bestSpread).toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                    <DollarSign className="w-3.5 h-3.5" />
                    ₦{Number(scan.bestNetProfit).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}

            {scans.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                  No scan history recorded yet. Run the scanner to start tracking metrics.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isPro && (
        <div className="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <Lock className="w-8 h-8 text-gray-700 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Historical Insights Limited</h3>
          <p className="text-gray-400 max-w-sm text-sm mb-6">Free users can only view the latest 3 scanner runs. Upgrade to Pro for full historical access and trend analysis.</p>
          <Link href="/dashboard/billing" className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold px-6 py-2 rounded-lg transition-colors">
            View All Scans
          </Link>
        </div>
      )}
    </div>
  );
}
