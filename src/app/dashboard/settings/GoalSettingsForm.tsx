"use client";

import { updateGoals } from "../journal/actions";
import { Target, Lock } from "lucide-react";
import Link from "next/link";

interface GoalSettingsFormProps {
  initialData: {
    dailyProfitTarget: string;
    weeklyProfitTarget: string;
  } | null;
  isPro: boolean;
}

export function GoalSettingsForm({ initialData, isPro }: GoalSettingsFormProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mt-6 relative">
      {!isPro && (
        <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Link href="/dashboard/billing" className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <Lock className="w-3 h-3 text-purple-400" /> Upgrade to Set Goals
            </Link>
        </div>
      )}

      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <Target className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">Profit Goals</h2>
      </div>
      
      <form action={updateGoals} className={`p-6 space-y-6 ${!isPro ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Daily Profit Target (₦)
            </label>
            <input 
              name="dailyProfitTarget" 
              type="number" 
              disabled={!isPro}
              defaultValue={initialData?.dailyProfitTarget || "10000"} 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Weekly Profit Target (₦)
            </label>
            <input 
              name="weeklyProfitTarget" 
              type="number" 
              disabled={!isPro}
              defaultValue={initialData?.weeklyProfitTarget || "50000"} 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={!isPro} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50">
            Save Goals
          </button>
        </div>
      </form>
    </div>
  );
}
