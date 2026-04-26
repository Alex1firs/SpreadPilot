import { Repeat, AlertTriangle, ArrowRight } from 'lucide-react';
import { db } from '@/db';
import { triangularOpportunities } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, canAccessProFeatures } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default async function TriangularPage() {
  const { userId } = await auth();
  const sub = await getUserSubscription(userId || '');
  const isPro = canAccessProFeatures(sub.plan);

  const opportunities = await db.select()
    .from(triangularOpportunities)
    .orderBy(desc(triangularOpportunities.timestamp))
    .limit(50); // Get latest 50 records

  const displayOpportunities = isPro ? opportunities : opportunities.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Repeat className="h-6 w-6 text-indigo-500" />
          <h1 className="text-2xl font-bold text-white">Triangular Arbitrage</h1>
          <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Beta Engine
          </span>
        </div>
        <p className="text-gray-400">
          Monitor instantaneous 3-leg profit loops on a single exchange. These loops have NO WITHDRAWAL FEES and execute in milliseconds.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-sm">
        <AlertTriangle className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-indigo-400 font-medium">Algorithmic Observation Only (Phase 5 Auto-Execution Pending)</p>
          <p className="text-indigo-500/60 text-xs mt-0.5">
            Triangular loops open and close within actual milliseconds. This page serves to observe the mathematical edge your capital has, surfacing paths where high frequency trading bots operate. Full automated execution allowing you to seize these fractions of a second is incoming!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-6">
        {displayOpportunities.map((opp) => (
          <div key={opp.id} className="bg-gray-900 border border-gray-800 hover:border-indigo-500/30 transition-colors rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group relative overflow-hidden">
             
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-r ${Number(opp.netProfitPercent) > 0.5 ? 'from-emerald-500/5' : 'from-indigo-500/5'} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 w-full">
              {/* Core Information */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Exchange</span>
                <div className="flex items-center gap-2 text-white font-semibold">
                  {opp.exchange}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Found: {new Date(opp.timestamp).toLocaleTimeString()}</div>
              </div>
              
              {/* Path Routing */}
              <div className="space-y-1 md:col-span-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Triangle Path Logic</span>
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-gray-300">
                  <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{opp.step1Detail.split(' ')[0]} {opp.step1Detail.split(' ')[1]}</span>
                  <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
                  <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{opp.step2Detail.split(' ')[0]} {opp.step2Detail.split(' ')[1]}</span>
                  <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
                  <span className="bg-gray-800 px-2 py-0.5 rounded text-white">{opp.step3Detail.split(' ')[0]} {opp.step3Detail.split(' ')[1]}</span>
                </div>
                <div className="text-[11px] text-indigo-400 font-medium">Path: {opp.trianglePath}</div>
              </div>

              {/* Profitability */}
              <div className={`space-y-1 text-left md:text-right ${!isPro ? 'blur-md select-none' : ''}`}>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Net Loop Profit (Post-Fees)</span>
                <div className={`font-black text-xl font-mono ${Number(opp.netProfitPercent) > 0.5 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                  +{Number(opp.netProfitPercent).toFixed(3)}%
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                  Gross: +{Number(opp.grossProfitPercent).toFixed(3)}%
                </div>
              </div>
            </div>

          </div>
        ))}

        {!isPro && opportunities.length > 3 && (
          <div className="p-4 text-center border border-gray-800 rounded-xl bg-gray-900/20 mt-2">
             <span className="text-sm text-gray-400">Upgrade to Pro to unlock real-time alerts and full historical loop access.</span>
          </div>
        )}

        {opportunities.length === 0 && (
          <div className="p-10 text-center border border-gray-800 border-dashed rounded-xl bg-gray-900/50 flex flex-col items-center justify-center">
             <Repeat className="w-8 h-8 text-gray-700 mb-3" />
             <span className="text-sm text-gray-400">No profitable loops found in the past scans. The engine is monitoring.</span>
          </div>
        )}
      </div>

    </div>
  );
}
