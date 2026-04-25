import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Activity, 
  Shield, 
  CheckCircle2, 
  TrendingUp, 
  Bell, 
  ClipboardList, 
  Lock, 
  Globe, 
  PieChart
} from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="bg-gray-950 text-gray-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="h-5 w-5 text-gray-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SpreadPilot</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/sign-up" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold bg-emerald-500 text-gray-950 rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8">
                  <Globe className="w-3.5 h-3.5" />
                  <span>P2P Trading Intelligence for Africa</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white leading-[1.1]">
                  Find profitable <span className="text-emerald-500">P2P spreads</span> before they close.
                </h1>
                
                <p className="text-xl text-gray-400 mb-10 max-w-xl leading-relaxed">
                  SpreadPilot monitors market signals across major exchanges to help African traders capture arbitrage opportunities, estimate real net profit, and track execution performance.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/sign-up" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold bg-emerald-500 text-gray-950 rounded-2xl hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-emerald-500/20">
                    Start Free <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold bg-gray-900 border border-gray-800 text-white rounded-2xl hover:bg-gray-800 transition-all">
                    View Live Dashboard
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-950 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        U{i}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Trusted by <span className="text-gray-300 font-semibold">1,000+ traders</span> across Nigeria and Ghana.
                  </p>
                </div>
              </div>

              <div className="relative lg:block hidden">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full -z-10" />
                <div className="bg-gray-900/50 backdrop-blur-2xl border border-gray-800 rounded-3xl p-4 shadow-2xl relative">
                  <Image 
                    src="/dashboard-preview.png" 
                    alt="SpreadPilot Dashboard Mockup" 
                    width={800} 
                    height={600} 
                    className="rounded-2xl opacity-90"
                  />
                  {/* Floating Notification */}
                  <div className="absolute -top-6 -right-6 bg-emerald-500 text-gray-950 p-4 rounded-2xl shadow-xl animate-bounce">
                    <Bell className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Strip */}
        <section className="border-y border-gray-800/50 bg-gray-900/30 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold text-white mb-1">98.5%</div>
                <div className="text-sm text-gray-500">Scanner Uptime</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold text-white mb-1">&lt; 10s</div>
                <div className="text-sm text-gray-500">Alert Latency</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold text-white mb-1">5+</div>
                <div className="text-sm text-gray-500">Exchanges Tracked</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-2xl font-bold text-white mb-1">₦0 Prepaid</div>
                <div className="text-sm text-gray-500">Free Tier Forever</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for real P2P execution.</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Stop chasing ghost spreads. SpreadPilot accounts for actual fees, local bank slippage, and merchant ratings.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  icon: Globe,
                  title: "Scan Market Signals",
                  desc: "Our engine scans multiple P2P buy/sell orders across Binance*, Bybit, OKX, and more."
                },
                {
                  icon: TrendingUp,
                  title: "Calculate Net Profit",
                  desc: "We subtract withdrawal fees, transfer costs, and slippage buffer automatically."
                },
                {
                  icon: Bell,
                  title: "Get Real-time Alerts",
                  desc: "Receive instant notifications via Telegram when a spread meets your risk and profit criteria."
                },
                {
                  icon: ClipboardList,
                  title: "Log & Track Trades",
                  desc: "Record your actual execution in the built-in trade journal to improve your long-term ROI."
                }
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className="mb-6 w-12 h-12 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-gray-950 transition-all">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center text-xs text-gray-600">
              * Binance NGN P2P monitoring depends on regional availability and API status.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-gray-900/20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-10 flex flex-col justify-between overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Multi-Exchange Scanner</h3>
                  <p className="text-gray-400 text-lg mb-8 max-w-md">
                    Aggregate liquidity signals from Bybit, OKX, KuCoin, and more into a single clean interface. Filter by payment method including Bank Transfer, Kuda, and OPay.
                  </p>
                </div>
                <div className="mt-8 flex gap-4 overflow-hidden mask-fade-right">
                  {['Binance', 'Bybit', 'OKX', 'KuCoin', 'PalmPay'].map(ex => (
                    <div key={ex} className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-full text-sm font-semibold text-gray-300">
                      {ex}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 group hover:border-emerald-500/30 transition-all flex flex-col">
                <Bell className="w-12 h-12 text-emerald-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Telegram Alerts</h3>
                <p className="text-gray-500 flex-1">
                  Customizable alert thresholds. Get notified based on specific spread percentages, minimum net profit, or risk levels.
                </p>
                <div className="mt-8 p-4 bg-gray-950 rounded-2xl border border-gray-800 italic text-sm text-gray-400">
                  &quot;🚀 New Opportunity: Bybit -&gt; OKX (Spread 2.1%)&quot;
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 group hover:border-emerald-500/30 transition-all">
                <Shield className="w-12 h-12 text-emerald-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Smart Risk Engine</h3>
                <p className="text-gray-500">
                  Not all spreads are equal. We score each opportunity based on price stability, merchant completion rates, and liquidity depth.
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 group hover:border-emerald-500/30 transition-all flex flex-col">
                <ClipboardList className="w-12 h-12 text-emerald-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Trade Journal</h3>
                <p className="text-gray-500 flex-1">
                  Track every execution. Compare your planned profit with real results. Download history for tax or accounting purposes.
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 group hover:border-emerald-500/30 transition-all">
                <PieChart className="w-12 h-12 text-emerald-500 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Advanced Analytics</h3>
                <p className="text-gray-500">
                  Premium charts showing market trends, average daily spreads, and best times of day to trade across different corridors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, fair pricing.</h2>
              <p className="text-gray-400 max-w-xl mx-auto text-lg">
                Pick the plan that fits your trading volume. From curious beginners to professional arbitrageurs.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-10 flex flex-col">
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-white mb-1">Explorer</h4>
                  <div className="text-4xl font-bold text-white">₦0 <span className="text-sm font-normal text-gray-500">/ forever</span></div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Top 2 Live Opportunities</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Limited Scan History</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-500 line-through decoration-gray-700">
                    <Lock className="w-4 h-4" />
                    <span>Telegram Alerts</span>
                  </li>
                </ul>
                <Link href="/sign-up" className="w-full py-4 px-6 text-center font-bold text-white bg-gray-800 rounded-2xl hover:bg-gray-700 transition-colors">
                  Start Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-emerald-500/5 border-2 border-emerald-500 rounded-3xl p-10 flex flex-col relative shadow-2xl shadow-emerald-500/10 scale-105">
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-emerald-500 text-gray-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Best for Traders
                </div>
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-white mb-1">Pro Arber</h4>
                  <div className="text-4xl font-bold text-white">₦5,000 <span className="text-sm font-normal text-gray-500">/ month</span></div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Infinite Arbitrage Table</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Instant Telegram Alerts</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Full Scan History</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Trade Journal & Goals</span>
                  </li>
                </ul>
                <Link href="/sign-up" className="w-full py-4 px-6 text-center font-bold text-gray-950 bg-emerald-500 rounded-2xl hover:bg-emerald-400 transition-all">
                  Get Pro Now
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-10 flex flex-col">
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-white mb-1">Institutional</h4>
                  <div className="text-4xl font-bold text-white">₦15,000 <span className="text-sm font-normal text-gray-500">/ month</span></div>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Advanced Market Analytics</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Priority Support</span>
                  </li>
                </ul>
                <Link href="/sign-up" className="w-full py-4 px-6 text-center font-bold text-white bg-gray-800 rounded-2xl hover:bg-gray-700 transition-colors">
                  Join Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 -z-10" />
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8">
              Start tracking smarter P2P opportunities today.
            </h2>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed">
              Join thousands of traders using SpreadPilot to maximize their NGN/USDT arbitrage efficiency. No credit card required to start.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-5 text-xl font-bold bg-emerald-500 text-gray-950 rounded-2xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/20">
                Create Free Account <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
            <p className="mt-8 text-sm text-gray-500">
              Already using SpreadPilot? <Link href="/sign-in" className="text-emerald-500 hover:underline">Log in to your account</Link>
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-900 py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 grayscale brightness-200 opacity-50">
            <Activity className="h-5 w-5" />
            <span className="text-lg font-bold">SpreadPilot</span>
          </div>
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} SpreadPilot Intelligence. Not financial advice.
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
