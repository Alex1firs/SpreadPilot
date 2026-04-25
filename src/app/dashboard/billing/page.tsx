import { getUserSubscription, PLANS } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { Check, Zap, Rocket, Star } from "lucide-react";
import { UpgradeButton } from "./UpgradeButton";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const sub = await getUserSubscription(userId);
  const currentPlan = sub.plan;

  const plans = [
    {
      name: PLANS.FREE,
      price: 0,
      description: "Basic scanner access for trial users.",
      features: ["Top 2 opportunities only", "Market prices (Profit blurred)", "Telegram alerts disabled", "Latest 3 history scans", "Manual trade journal"],
      icon: <Zap className="w-6 h-6 text-gray-400" />,
      color: "border-gray-800"
    },
    {
      name: PLANS.PRO,
      price: 5000,
      description: "For serious traders who want real-time speed.",
      features: ["Unlimited opportunity access", "Full net profit breakdown", "Real-time Telegram alerts", "Full scan history access", "Trade journal + Goals tracking"],
      icon: <Rocket className="w-6 h-6 text-emerald-400" />,
      color: "border-emerald-500/50 bg-emerald-500/5 outline outline-emerald-500/20"
    },
    {
      name: PLANS.PREMIUM,
      price: 15000,
      description: "The ultimate edge for bulk arbitrageurs.",
      features: ["Everything in Pro", "Priority Badge & Status", "Advanced analytics cards", "Priority alert processing", "Personal configuration support"],
      icon: <Star className="w-6 h-6 text-purple-400" />,
      color: "border-purple-500/50 bg-purple-500/5"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Plans & Billing</h1>
        <p className="text-gray-400">Manage your subscription and unlock advanced arbitrage features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.name} className={`relative flex flex-col p-6 rounded-2xl border ${p.color} transition-all`}>
            {currentPlan === p.name && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-100 text-gray-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Current Plan
              </div>
            )}
            
            <div className="mb-4">{p.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">₦{p.price.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">/mo</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 flex-grow">{p.description}</p>
            
            <div className="space-y-3 mb-8">
              {p.features.map(f => (
                <div key={f} className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {p.price > 0 && currentPlan !== p.name ? (
              <UpgradeButton planName={p.name} amount={p.price} />
            ) : (
              <button disabled className="w-full bg-gray-800 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed">
                {currentPlan === p.name ? "Your Current Plan" : "Included"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-950/50 border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-400 italic">
          Payments are processed securely via **Paystack**. All plans renew monthly.
        </div>
        <div className="flex items-center gap-2">
          <Image src="https://paystack.com/assets/payment/paystack-badge-light.svg" alt="Paystack Badge" width={120} height={32} />
        </div>
      </div>
    </div>
  );
}
