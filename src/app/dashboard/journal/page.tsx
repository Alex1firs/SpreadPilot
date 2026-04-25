import { db } from "@/db";
import { tradeJournal } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { LogTradeModal } from "./LogTradeModal";
import { BookOpen, TrendingUp, DollarSign, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const trades = await db.select()
    .from(tradeJournal)
    .where(eq(tradeJournal.userClerkId, userId))
    .orderBy(desc(tradeJournal.createdAt));

  const totalNetProfit = trades.reduce((sum, t) => sum + parseFloat(t.netProfitNgn), 0);
  const winRate = trades.length > 0 ? (trades.filter(t => parseFloat(t.netProfitNgn) > 0).length / trades.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Journal</h1>
          <p className="text-gray-400">Keep track of your manual and automated arbitrage executions.</p>
        </div>
        <LogTradeModal />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Logged Profit</span>
            <div className="bg-emerald-500/10 p-1.5 rounded">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">₦{totalNetProfit.toLocaleString()}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Trades</span>
            <div className="bg-blue-500/10 p-1.5 rounded">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{trades.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Win Rate</span>
            <div className="bg-purple-500/10 p-1.5 rounded">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-950/50 border-b border-gray-800">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Route</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Volume</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Net Profit</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {trades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-800/20 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white font-medium">{new Date(trade.createdAt).toLocaleDateString()}</div>
                  <div className="text-[10px] text-gray-500">{new Date(trade.createdAt).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <span className="font-bold text-emerald-400">{trade.buyExchange}</span>
                    <ArrowRight className="w-3 h-3 text-gray-600" />
                    <span className="font-bold text-emerald-400">{trade.sellExchange}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    ₦{parseFloat(trade.buyPrice).toLocaleString()} → ₦{parseFloat(trade.sellPrice).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-gray-300">{trade.volumeUsdt} USDT</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-bold text-emerald-400">
                    +₦{parseFloat(trade.netProfitNgn).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[11px] text-gray-400 max-w-[200px] truncate" title={trade.notes || ''}>
                    {trade.notes || "-"}
                  </div>
                </td>
              </tr>
            ))}

            {trades.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                  Your trade journal is empty. Log your first trade above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
