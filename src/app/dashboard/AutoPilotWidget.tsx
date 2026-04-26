'use client';

import { useState } from 'react';

import { Zap, ShieldCheck, AlertCircle, Settings2 } from 'lucide-react';
import { toggleAutoPilot, updateAutoPilotConfig } from './actions';

interface AutoPilotWidgetProps {
  initialEnabled: boolean;
  initialMaxSize: string;
  initialMinProfit: string;
}

export function AutoPilotWidget({ initialEnabled, initialMaxSize, initialMinProfit }: AutoPilotWidgetProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [maxSize, setMaxSize] = useState(initialMaxSize);
  const [minProfit, setMinProfit] = useState(initialMinProfit);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  async function handleToggle() {
    const newState = !enabled;
    setEnabled(newState);
    try {
      await toggleAutoPilot(newState);
    } catch (error) {
      setEnabled(!newState);
      alert('Failed to toggle AutoPilot. Please check your connection.');
    }
  }

  async function handleSaveSettings() {
    setIsSaving(true);
    try {
      await updateAutoPilotConfig(parseFloat(maxSize), parseFloat(minProfit));
      setShowSettings(false);
    } catch (error) {
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
      enabled 
        ? 'bg-emerald-950/20 border-emerald-500/30' 
        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
    }`}>
      {/* Background Animated Pulse when active */}
      {enabled && (
        <div className="absolute top-0 right-0 p-4">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${enabled ? 'bg-emerald-500 text-gray-950' : 'bg-gray-800 text-gray-500'}`}>
              <Zap className={`h-6 w-6 ${enabled ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                AutoPilot Engine
                {enabled && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">Active</span>}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Automatically execute profitable arbitrage loops using your connected API keys.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-700"
            >
              <Settings2 className="h-5 w-5" />
            </button>
            <div 
              onClick={handleToggle}
              className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 relative ${enabled ? 'bg-emerald-500' : 'bg-gray-700'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Max Trade Size (USDT)</label>
              <input 
                type="number" 
                value={maxSize}
                onChange={(e) => setMaxSize(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Min. Profit Threshold (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={minProfit}
                onChange={(e) => setMinProfit(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-2">
               <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-all disabled:opacity-50"
               >
                 {isSaving ? 'Saving...' : 'Save AutoPilot Configuration'}
               </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/50" />
            Encryption: AES-256
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <AlertCircle className="h-3.5 w-3.5 text-blue-500/50" />
            Market Orders Only
          </div>
        </div>
      </div>
    </div>
  );
}
