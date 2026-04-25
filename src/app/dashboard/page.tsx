import { MetricCard } from '@/components/ui/MetricCard';
import { Activity, TrendingUp, DollarSign, BellRing, Clock, ArrowUpRight, BarChart3, Target } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { opportunities, exchangePrices, alertSettings, scanRuns, tradeJournal, userGoals } from '@/db/schema';
import { eq, desc, gte, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { MiniTrendChart } from '@/components/charts/mini-trend';
import { getUserSubscription, PLANS } from '@/lib/subscription';
import { PremiumAnalytics } from './PremiumAnalytics';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const { userId } = await auth();
  if (!userId) return null;

  const sub = await getUserSubscription(userId);
  const isPremium = sub.plan === PLANS.PREMIUM;
  const isPro = sub.plan === PLANS.PRO || isPremium;

  const activeSpreads = await db.select()
    .from(opportunities)
    .where(eq(opportunities.isActive, true))
    .orderBy(desc(opportunities.spread));

  const lastPrices = await db.select({
    lastUpdated: exchangePrices.lastUpdated,
  })
  .from(exchangePrices)
  .orderBy(desc(exchangePrices.lastUpdated))
  .limit(1);

  const alertsStatus = await db.select()
    .from(alertSettings)
    .where(eq(alertSettings.userClerkId, userId))
    .limit(1);

  // Historical Data for charts
  const recentRuns = await db.select()
    .from(scanRuns)
    .where(eq(scanRuns.status, 'completed'))
    .orderBy(desc(scanRuns.startedAt))
    .limit(20);

  const spreadTrend = [...recentRuns].reverse().map(r => Number(r.bestSpread));
  const profitTrend = [...recentRuns].reverse().map(r => Number(r.bestNetProfit));

  // Journal Stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const todayTrades = await db.select()
    .from(tradeJournal)
    .where(and(eq(tradeJournal.userClerkId, userId), gte(tradeJournal.createdAt, today)));

  const weeklyTrades = await db.select()
    .from(tradeJournal)
    .where(and(eq(tradeJournal.userClerkId, userId), gte(tradeJournal.createdAt, weekAgo)));

  const profitToday = todayTrades.reduce((sum, t) => sum + parseFloat(t.netProfitNgn), 0);
  const profitWeekly = weeklyTrades.reduce((sum, t) => sum + parseFloat(t.netProfitNgn), 0);

  const userGoal = await db.select().from(userGoals).where(eq(userGoals.userClerkId, userId)).limit(1);
  const dailyTarget = parseFloat(userGoal[0]?.dailyProfitTarget || "10000");
  const weeklyTarget = parseFloat(userGoal[0]?.weeklyProfitTarget || "50000");

  const dailyProgress = Math.min((profitToday / dailyTarget) * 100, 100);
  const weeklyProgress = Math.min((profitWeekly / weeklyTarget) * 100, 100);

  const totalOpps = activeSpreads.length;
  const bestSpread = totalOpps > 0 ? Math.max(...activeSpreads.map(s => Number(s.spread))) : 0;
  const totalNetProfit = activeSpreads.reduce((sum, opp) => sum + Number(opp.netProfit), 0);
  const scanTime = lastPrices.length > 0 ? lastPrices[0].lastUpdated.toLocaleTimeString() : 'N/A';
  const isAlerting = alertsStatus[0]?.alertsEnabled ?? false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back. Here&apos;s your arbitrage summary for today.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            Last Scan: {scanTime}
          </div>
          <Link href="/dashboard/opportunities" className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2 w-fit">
            <Activity className="w-4 h-4" />
            View Active Spreads
          </Link>
        </div>
      </div>

      {isPremium && <PremiumAnalytics />}

      {/* Market Trends Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Spread Volatility</span>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                {bestSpread.toFixed(2)}%
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">Live</span>
              </div>
            </div>
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="h-16 w-full">
            <MiniTrendChart data={spreadTrend} color="#10b981" />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Profit Depth (Net)</span>
              <div className="text-xl font-bold text-white flex items-center gap-2">
                ₦{totalNetProfit.toLocaleString()}
                <ArrowUpRight className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <BarChart3 className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="h-16 w-full">
            <MiniTrendChart data={profitTrend} color="#3b82f6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Profit Today" 
          value={`₦ ${profitToday.toLocaleString()}`} 
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />} 
        />
        <MetricCard 
          title="Profit This Week" 
          value={`₦ ${profitWeekly.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />} 
        />
        <MetricCard 
          title="Daily Goal Progress" 
          value={`${dailyProgress.toFixed(0)}%`} 
          icon={<Target className="w-5 h-5 text-purple-400" />} 
        />
        <MetricCard 
          title="Alert Status" 
          value={isAlerting ? (isPro ? "Active" : "Disabled (Free)") : "Disabled"} 
          icon={<BellRing className={`w-5 h-5 ${isAlerting && isPro ? 'text-emerald-400' : 'text-gray-500'}`} />} 
        />
      </div>

      {/* Progress Bars */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Target className="w-4 h-4" /> Profit Goal Tracking
        </h3>
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-white">Daily Target (₦{dailyTarget.toLocaleString()})</span>
              <span className="text-sm font-bold text-emerald-400">₦{profitToday.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" 
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-white">Weekly Target (₦{weeklyTarget.toLocaleString()})</span>
              <span className="text-sm font-bold text-blue-400">₦{profitWeekly.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500" 
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {!isPremium && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center mt-8">
           <Star className="w-10 h-10 text-purple-400 mb-4" />
           <h3 className="text-lg font-bold text-white mb-2">Unlock Market Intelligence</h3>
           <p className="text-sm text-gray-400 max-w-lg mb-6">Premium members get advanced analytics cards, priority scanning, and full FX volatility tracking. Elevate your arbitrage game today.</p>
           <Link href="/dashboard/billing" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20">
             Upgrade to Premium
           </Link>
        </div>
      )}
    </div>
  );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
