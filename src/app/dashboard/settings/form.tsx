"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { saveAlertSettings } from "./actions";
import { Bell, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending || disabled}
      className={`bg-emerald-500 hover:bg-emerald-600 text-gray-950 px-4 py-2 rounded-lg font-medium transition-colors ${pending || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {pending ? 'Saving...' : 'Save Preferences'}
    </button>
  );
}

export function AlertSettingsForm({ initialData, isPro }: { 
  initialData: { 
    alertsEnabled: boolean; 
    telegramChatId: string | null; 
    minSpread: string; 
    minProfit: string; 
    maxRiskLevel: string; 
  } | null,
  isPro: boolean 
}) {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function clientAction(formData: FormData) {
    if (!isPro) return;
    setSuccessMsg("");
    setErrorMsg("");
    const result = await saveAlertSettings(formData);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.success) {
      setSuccessMsg(result.message || "Saved.");
    }
  }

  return (
    <form action={clientAction} className="grid grid-cols-1 gap-6 mt-8">
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Alert Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative">
        {!isPro && (
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm border-t-emerald-500/20">
              <Lock className="w-10 h-10 text-emerald-500 mb-4 mx-auto" />
              <h3 className="text-lg font-bold text-white mb-2">Telegram Alerts are Pro</h3>
              <p className="text-sm text-gray-400 mb-6">Upgrade to Pro or Premium to enable real-time Telegram alerts for arbitrage opportunities.</p>
              <Link href="/dashboard/billing" className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold px-6 py-2 rounded-lg transition-colors inline-block">
                See Pricing
              </Link>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <Bell className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-white">Alert Preferences</h2>
        </div>
        
        <div className={`p-6 space-y-6 ${!isPro ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div>
              <h4 className="text-white font-medium">Enable Telegram Alerts</h4>
              <p className="text-sm text-gray-400">Receive urgent spreads directly to your Telegram</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="alertsEnabled" defaultChecked={initialData?.alertsEnabled} disabled={!isPro} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Telegram Chat ID</label>
            <input type="text" name="telegramChatId" disabled={!isPro} defaultValue={initialData?.telegramChatId || ""} placeholder="e.g. 123456789" className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors" />
            <p className="text-xs text-gray-500">Ask @userinfobot on Telegram to get your numeric Chat ID.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Minimum Spread Percentage (%)</label>
            <input type="number" step="0.01" name="minSpread" disabled={!isPro} defaultValue={initialData?.minSpread ? Number(initialData.minSpread) : 1.5} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Minimum Estimated Profit (₦)</label>
            <input type="number" name="minProfit" disabled={!isPro} defaultValue={initialData?.minProfit ? Number(initialData.minProfit) : 5000} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Maximum Risk Level</label>
            <select name="maxRiskLevel" disabled={!isPro} defaultValue={initialData?.maxRiskLevel || "Medium"} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-emerald-500 transition-colors appearance-none">
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

        </div>
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex justify-end">
          <SubmitButton disabled={!isPro} />
        </div>
      </div>
    </form>
  );
}
