import { ArrowRight, AlertTriangle, ShieldCheck, Zap, Lock } from 'lucide-react';
import { db } from '@/db';
import { opportunities } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, canAccessProFeatures } from '@/lib/subscription';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OpportunitiesPage() {
  const { userId } = await auth();
  const sub = await getUserSubscription(userId || '');
  const isPro = canAccessProFeatures(sub.plan);

  const activeSpreads = await db.select()
    .from(opportunities)
    .where(eq(opportunities.isActive, true))
    .orderBy(desc(opportunities.netProfit));

  const displaySpreads = isPro ? activeSpreads : activeSpreads.slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-white">P2P Signals</h1>
          <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Estimated
          </span>
        </div>
        <p className="text-gray-400">Estimated P2P spreads based on market simulation. Not guaranteed live prices.</p>
      </div>

      {/* Estimated data banner */}
      <div className="flex items-start gap-3 p-4 bg-yellow-950/30 border border-yellow-500/20 rounded-xl text-sm">
        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-yellow-400 font-medium">P2P Signals — Estimated Data Only</p>
          <p className="text-yellow-500/60 text-xs mt-0.5">
            These opportunities are generated from P2P market estimates and are NOT guaranteed live exchange prices.
            For real confirmed arbitrage from public APIs, see{' '}
            <a href="/dashboard/spot" className="underline text-yellow-400">Spot Arbitrage</a>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displaySpreads.map((opp) => (
          <div key={opp.id} className="bg-gray-900 border border-gray-800 hover:border-emerald-500/30 transition-colors rounded-xl p-6 flex flex-col items-stretch gap-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Route / Method</span>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    {opp.buyExchange} <ArrowRight className="w-3.5 h-3.5 text-gray-600" /> {opp.sellExchange}
                  </div>
                  <div className="text-[11px] text-gray-400">{opp.paymentMethod}</div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Market Prices</span>
                  <div className="text-sm">
                    <span className="text-red-400 font-medium font-mono text-xs">₦{Number(opp.buyPrice).toLocaleString()}</span>
                    <span className="text-gray-700 mx-1.5">→</span>
                    <span className="text-emerald-400 font-medium font-mono text-xs">₦{Number(opp.sellPrice).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">Spread: {Number(opp.spread).toFixed(2)}%</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Confidence Score</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-16 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                      <div 
                        className={`h-full rounded-full ${
                          Number(opp.confidenceScore) > 80 ? 'bg-emerald-500' : 
                          Number(opp.confidenceScore) > 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${opp.confidenceScore}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${
                       Number(opp.confidenceScore) > 80 ? 'text-emerald-400' : 'text-gray-400'
                    }`}>{opp.confidenceScore}%</span>
                  </div>
                </div>

                <div className={`space-y-1 text-left md:text-right transition-all duration-500 ${!isPro ? 'blur-md select-none' : ''}`}>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Est. Net Profit</span>
                  <div className="text-emerald-400 font-black text-xl font-mono">
                    ₦{Number(opp.netProfit).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                    Capital: ₦{Number(opp.requiredCapitalNgn).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Fees and Breakdown Section */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800/50 text-[11px] relative z-10 transition-all duration-500 ${!isPro ? 'blur-sm select-none opacity-50' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Zap className="w-3 h-3 text-blue-400" />
                  Gross: <span className="text-gray-200">₦{Number(opp.grossProfit).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <ShieldCheck className="w-3 h-3 text-red-400/70" />
                  Fees: <span className="text-gray-200 text-red-300">₦{Number(opp.estimatedFees).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <AlertTriangle className="w-3 h-3 text-yellow-400/70" />
                  Slippage: <span className="text-gray-200">₦{Number(opp.slippageBuffer).toLocaleString()}</span>
                </div>
              </div>

              <div className="hidden md:flex justify-center items-center gap-4 text-gray-500 font-medium">
                Volume: {opp.volumeUsdt} USDT
              </div>

              <div className="flex items-center justify-end gap-3">
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all border ${
                  opp.riskLevel === 'Low' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                  opp.riskLevel === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 
                  'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                   {opp.riskLevel} Risk
                </div>
                <span className="text-[10px] text-gray-600 font-mono">
                  {new Date(opp.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>

            {!isPro && (
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent flex flex-col items-center justify-center p-6 text-center z-20">
                <Lock className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-sm font-bold text-white mb-1">Details Locked</p>
                <p className="text-xs text-gray-400 mb-3">Upgrade to Pro to see the full profit breakdown and risk analysis.</p>
                <Link href="/dashboard/billing" className="text-xs font-bold text-emerald-500 hover:underline">
                  Upgrade Now ➔
                </Link>
              </div>
            )}
          </div>
        ))}
        
        {!isPro && activeSpreads.length > 2 && (
          <div className="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <Lock className="w-8 h-8 text-gray-700 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">{activeSpreads.length - 2} More Opportunities Hidden</h3>
            <p className="text-gray-400 max-w-sm text-sm mb-6">Upgrade to Pro or Premium to unlock real-time access to all high-profit arbitrage routes.</p>
            <Link href="/dashboard/billing" className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold px-6 py-2 rounded-lg transition-colors">
               Unlock Everything
            </Link>
          </div>
        )}

        {activeSpreads.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-12 h-12 text-gray-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Market Stability Observed</h3>
            <p className="text-gray-400 max-w-sm text-sm">There are currently no arbitrage spreads that exceed our realistic profit thresholds (Fees + Slippage). We are continuing to monitor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
