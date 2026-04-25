"use client";

import { PieChart, Zap, Globe, ShieldCheck } from "lucide-react";

export function PremiumAnalytics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards">
      <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 border border-purple-500/30 rounded-xl p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-purple-500/10 p-2 rounded-lg">
            <PieChart className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Premium Only</span>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Exchange Market Share</h4>
        <p className="text-[10px] text-gray-500 mb-3">Dominance of liquidity providers across your routes.</p>
        <div className="space-y-2">
           <div className="flex justify-between text-[10px]">
             <span className="text-gray-400">Binance</span>
             <span className="text-white font-mono">42%</span>
           </div>
           <div className="h-1 bg-gray-950 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500 w-[42%]" />
           </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 border border-blue-500/30 rounded-xl p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Priority Queue</span>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Scanner Latency</h4>
        <p className="text-[10px] text-gray-500 mb-3">Real-time heartbeat of your priority scanning queue.</p>
        <div className="flex items-end gap-1 h-8">
          {[4,7,3,9,5,2,8,4,6,3].map((h, i) => (
            <div key={i} className="flex-1 bg-blue-500/40 rounded-t" style={{ height: `${h * 10}%` }} />
          ))}
        </div>
        <div className="mt-2 text-[10px] font-mono text-blue-400 text-center">Avg: 112ms</div>
      </div>

      <div className="bg-gradient-to-br from-emerald-900/20 to-gray-900 border border-emerald-500/30 rounded-xl p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-emerald-500/10 p-2 rounded-lg">
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Global Rates</span>
        </div>
        <h4 className="text-sm font-bold text-white mb-1">FX Volatility Index</h4>
        <p className="text-[10px] text-gray-500 mb-3">Global NGN/USD benchmark vs P2P markets.</p>
        <div className="text-xl font-black text-white font-mono">+1.2%</div>
        <div className="text-[10px] text-emerald-500 flex items-center gap-1">
          <TrendingUp className="w-2 h-2" /> Outperforming Banks
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-900/20 to-gray-900 border border-yellow-500/30 rounded-xl p-5 flex flex-col justify-center items-center text-center">
        <ShieldCheck className="w-8 h-8 text-yellow-500/40 mb-2" />
        <h4 className="text-sm font-bold text-white mb-1">Advanced Risk Filter</h4>
        <p className="text-[10px] text-gray-500">Scanning for suspicious liquidity patterns... Clear</p>
      </div>
    </div>
  );
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
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
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
