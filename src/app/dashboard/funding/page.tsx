import { Coins, AlertTriangle } from 'lucide-react';
import { db } from '@/db';
import { fundingRates } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { getUserSubscription, canAccessProFeatures } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default async function FundingRatesPage() {
  const { userId } = await auth();
  const sub = await getUserSubscription(userId || '');
  const isPro = canAccessProFeatures(sub.plan);

  const rates = await db.select()
    .from(fundingRates)
    .orderBy(desc(fundingRates.annualizedYield))
    .limit(50); // Get top 50 yields

  const displayRates = isPro ? rates : rates.slice(0, 3);
  
  // Highest yield for the calculator preview
  const topRate = displayRates.length > 0 ? displayRates[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Coins className="h-6 w-6 text-pink-500" />
          <h1 className="text-2xl font-bold text-white">Delta-Neutral Funding Yield</h1>
          <span className="text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Passive APR
          </span>
        </div>
        <p className="text-gray-400">
          Earn passive income by mathematically locking in funding rates on Futures markets without exposing capital to price crashes.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-pink-950/30 border border-pink-500/20 rounded-xl text-sm">
        <AlertTriangle className="h-4 w-4 text-pink-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-pink-400 font-medium">How Does Delta-Neutral Work?</p>
          <p className="text-pink-500/60 text-xs mt-0.5">
            If Token X has a massive positive APY, it means Long traders are paying Short traders. By buying Token X on the Spot market with half your capital, and shorting Token X on the Futures market with the other half, your portfolio balance never changes regardless of whether Token X goes up or down. But every 8 hours, you collect the raw yield below securely into your balance!
          </p>
        </div>
      </div>

      {topRate && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="space-y-2 flex-1">
             <h2 className="text-gray-400 font-medium text-sm">Top Yielding Asset (Global Tracker)</h2>
             <div className="flex items-end gap-3">
               <span className="text-4xl font-black text-white">{topRate.symbol}</span>
               <span className="text-pink-400 font-bold mb-1">on {topRate.exchange}</span>
             </div>
             <p className="text-xs text-gray-500">Pays out next at {new Date(topRate.nextFundingTime).toLocaleTimeString()}</p>
           </div>

           <div className={`flex flex-col items-end shrink-0 ${!isPro ? 'blur-sm select-none' : ''}`}>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Projected APY</span>
              <div className="text-5xl font-black text-emerald-400 tracking-tighter">
                 {Number(topRate.annualizedYield).toFixed(1)}%
              </div>
           </div>
        </div>
      )}

      {/* Grid of Results */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 tracking-tight mt-6">Live Global Yield Opportunities</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-900 font-bold tracking-widest border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Token Pair</th>
                <th className="px-4 py-3">Exchange</th>
                <th className="px-4 py-3">Raw 8H Rate</th>
                <th className="px-4 py-3">Next Payout</th>
                <th className="px-4 py-3 rounded-tr-lg">Annualized APY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {displayRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-3 text-white font-bold">
                    {rate.symbol}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {rate.exchange}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-300">
                    {(Number(rate.fundingRate) * 100).toFixed(4)}%
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(rate.nextFundingTime).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className={`px-2 py-1 rounded text-xs font-black ${
                      Number(rate.annualizedYield) > 50 ? 'bg-emerald-500/20 text-emerald-400' :
                      Number(rate.annualizedYield) > 10 ? 'bg-pink-500/20 text-pink-400' : 'text-gray-400'
                    }`}>
                      {Number(rate.annualizedYield).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!isPro && rates.length > 3 && (
            <div className="p-4 text-center border border-gray-800 border-t-0 rounded-b-xl bg-gray-900/40">
               <span className="text-sm text-gray-400">Subscribe to Pro to unlock all {rates.length} yielding assets and receive high-APY Telegram alerts instantly.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
