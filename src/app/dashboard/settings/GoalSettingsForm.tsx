"use client";

import { useState } from "react";
import { saveGoalSettings } from "./actions";
import { Target, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface GoalSettingsFormProps {
  initialData: {
    dailyProfitTarget: string;
    weeklyProfitTarget: string;
  } | null;
  isPro: boolean;
}

export function GoalSettingsForm({ initialData, isPro }: GoalSettingsFormProps) {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function clientAction(formData: FormData) {
    if (!isPro) return;
    setSuccessMsg("");
    setErrorMsg("");
    setIsSubmitting(true);
    
    try {
      const result = await saveGoalSettings(formData);
      if (result.error) {
        setErrorMsg(result.error);
      } else if (result.success) {
        setSuccessMsg(result.message || "Goals updated.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
      
      <form action={clientAction} className={`p-6 space-y-6 ${!isPro ? 'opacity-30 pointer-events-none' : ''}`}>
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}
        
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

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
          <button 
            type="submit" 
            disabled={!isPro || isSubmitting} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Goals"}
          </button>
        </div>
      </form>
    </div>
  );
}
