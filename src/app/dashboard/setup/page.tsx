import { HelpCircle, ExternalLink, ShieldCheck, Key, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SetupGuidePage() {
  const referralLinks = [
    { name: 'Binance', link: 'https://www.binance.com/en/activity/referral-entry?fromActivityPage=true&ref=LIMIT_RL2C7X3U', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Bybit', link: 'https://www.bybit.com/invite?ref=YOUR_REF_CODE', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'OKX', link: 'https://www.okx.com/join/YOUR_REF_CODE', color: 'text-white', bg: 'bg-white/10' },
    { name: 'MEXC', link: 'https://www.mexc.com/register?inviteCode=YOUR_REF_CODE', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Gate.io', link: 'https://www.gate.io/signup/YOUR_REF_CODE', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-emerald-500" />
          Complete Setup Guide
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Follow these steps to unlock the full potential of SpreadPilot and your trading capital.
        </p>
      </div>

      {/* Step 1: Exchange Accounts */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 text-gray-950 w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
          <h2 className="text-xl font-bold text-white">Create & Link Exchange Accounts</h2>
        </div>
        
        <p className="text-gray-400">
          To capture arbitrage gaps, you need accounts on multiple exchanges. Use the links below to create your accounts. By using these links, you get **trading fee discounts** while supporting the platform.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {referralLinks.map((ex) => (
            <a 
              key={ex.name}
              href={ex.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ex.bg} border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-white/20 transition-all group`}
            >
              <div className={`${ex.color} font-bold text-lg group-hover:scale-110 transition-transform`}>{ex.name}</div>
              <div className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1">
                Open Account <ExternalLink className="h-3 w-3" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Step 2: API Keys */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 text-gray-950 w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
          <h2 className="text-xl font-bold text-white">Setup API Keys for AutoPilot</h2>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Key className="h-6 w-6 text-emerald-500" />
              <h3 className="font-bold text-white">Generate Keys</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Login to each exchange, navigate to "API Management", and create a new key named "SpreadPilot".</p>
            </div>
            <div className="space-y-3">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
              <h3 className="font-bold text-white">Permissions</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Enable **"Enable Spot & Margin Trading"**. Strictly **DISABLE** "Enable Withdrawals".</p>
            </div>
            <div className="space-y-3">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h3 className="font-bold text-white">Fast Execution</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Connect your keys in the <Link href="/dashboard/settings/api-keys" className="text-emerald-500 underline">API Credentials</Link> section.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Telegram Alerts */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 text-gray-950 w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
          <h2 className="text-xl font-bold text-white">Enable Real-Time Alerts</h2>
        </div>
        
        <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Never miss a gap again.</h3>
              <p className="text-sm text-gray-400">Our Telegram bot monitors the market 24/7. When a verified opportunity appears, it hits your phone instantly.</p>
           </div>
           <Link href="/dashboard/settings" className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold text-white transition-all shrink-0">
              Setup Telegram
           </Link>
        </div>
      </section>

      {/* Final Checklist */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-emerald-400 mb-6">Launch Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Accounts created on 3+ exchanges',
            'Minimum $100 capital in USDT per exchange',
            'API Keys stored (No Withdrawals)',
            'AutoPilot VIP Toggle enabled',
            'Telegram Notifications active',
            'Billing plan set to Pro/Premium'
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-emerald-500/80">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
