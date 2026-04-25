import Link from 'next/link';
import { Activity, LayoutDashboard, LineChart, BookOpen, Settings, History, CreditCard } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { getUserSubscription, PLANS } from '@/lib/subscription';
import { auth } from '@clerk/nextjs/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const sub = await getUserSubscription(userId || '');
  const currentPlan = sub.plan;

  const planStyles: Record<string, string> = {
    [PLANS.FREE]: "bg-gray-800 text-gray-400",
    [PLANS.PRO]: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    [PLANS.PREMIUM]: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">SpreadPilot</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link href="/dashboard/opportunities" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
            <LineChart className="h-4 w-4" />
            Opportunities
          </Link>
          <Link href="/dashboard/history" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
            <History className="h-4 w-4" />
            Scan History
          </Link>
          <Link href="/dashboard/journal" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
            <BookOpen className="h-4 w-4" />
            Trade Journal
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
            <CreditCard className="h-4 w-4" />
            Plans & Billing
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800 flex items-center gap-3">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">My Account</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-0.5 w-fit ${planStyles[currentPlan] || planStyles[PLANS.FREE]}`}>
              {currentPlan}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm md:hidden shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-lg font-bold text-white">Pilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${planStyles[currentPlan] || planStyles[PLANS.FREE]}`}>
              {currentPlan}
            </span>
            <UserButton />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
