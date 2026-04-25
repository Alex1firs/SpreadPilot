"use client";

import { useState } from "react";
import { logTrade } from "./actions";
import { Plus, X, BookOpen, Loader2 } from "lucide-react";

export function LogTradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await logTrade(formData);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to log trade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-gray-950 px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/10"
      >
        <Plus className="w-4 h-4" />
        Log Manual Trade
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-950/50">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-white">Log Arbitrage Execution</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Buy Exchange</label>
                  <select name="buyExchange" required className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none appearance-none">
                    <option>Binance</option>
                    <option>Bybit</option>
                    <option>OKX</option>
                    <option>KuCoin</option>
                    <option>Yellow Card</option>
                    <option>Remitano</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sell Exchange</label>
                  <select name="sellExchange" required className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none appearance-none">
                    <option>Bybit</option>
                    <option>Binance</option>
                    <option>OKX</option>
                    <option>KuCoin</option>
                    <option>Remitano</option>
                    <option>Yellow Card</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Volume (USDT)</label>
                <input 
                  name="volumeUsdt" 
                  type="number" 
                  step="0.01" 
                  required 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none" 
                  placeholder="1000.00" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Buy Price (₦/USDT)</label>
                  <input 
                    name="buyPrice" 
                    type="number" 
                    step="0.01" 
                    required 
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none" 
                    placeholder="1650.50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sell Price (₦/USDT)</label>
                  <input 
                    name="sellPrice" 
                    type="number" 
                    step="0.01" 
                    required 
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none" 
                    placeholder="1680.00" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notes (Optional)</label>
                <textarea 
                  name="notes" 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-emerald-500 outline-none h-20 resize-none" 
                  placeholder="Quick execution, bank transfer..." 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="flex-1 border border-gray-800 text-gray-400 font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Logging...' : 'Save Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
