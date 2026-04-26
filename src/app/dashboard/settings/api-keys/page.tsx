import { Key, ShieldCheck, Trash2, Plus, AlertCircle } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { userApiKeys } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { saveApiKey, deleteApiKey } from './actions';

export default async function ApiKeysPage() {
  const { userId } = await auth();
  const keys = await db.select().from(userApiKeys).where(eq(userApiKeys.userClerkId, userId || ''));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Key className="h-6 w-6 text-emerald-500" />
          Exchange API Keys
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your exchange credentials for automated execution. Keys are encrypted with AES-256.
        </p>
      </div>

      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 flex gap-3 text-sm">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
        <div className="text-emerald-500/80">
          <p className="font-bold text-emerald-400">Security Requirement:</p>
          <p>Strictly use keys with **Trading permission only**. Never provide keys with Withdrawal permissions. We automatically reject any keys that attempt to withdraw funds.</p>
        </div>
      </div>

      {/* List Existing Keys */}
      <div className="grid gap-4">
        {keys.map((k) => (
          <div key={k.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">{k.exchange}</h3>
              <p className="text-gray-500 text-xs mt-1">Added on {k.createdAt.toLocaleDateString()}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-xs text-gray-400 font-mono">API Key: ****************{k.apiKey.slice(-4)}</span>
              </div>
            </div>
            <form action={async () => {
              'use server';
              await deleteApiKey(k.id);
            }}>
              <button className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-lg transition-colors">
                <Trash2 className="h-5 w-5" />
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Add New Key Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-500" />
            Add New Exchange Key
          </h2>
        </div>
        <form action={saveApiKey} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Exchange</label>
              <select 
                name="exchange" 
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
              >
                <option value="Binance">Binance</option>
                <option value="Bybit">Bybit</option>
                <option value="OKX">OKX</option>
                <option value="KuCoin">KuCoin</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">API Key</label>
              <input 
                type="text" 
                name="apiKey" 
                placeholder="Enter your API key"
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">API Secret</label>
              <input 
                type="password" 
                name="apiSecret" 
                placeholder="Enter your API secret"
                required
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Passphrase (Optional)</label>
              <input 
                type="password" 
                name="passphrase" 
                placeholder="Required for OKX/KuCoin"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors" 
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-yellow-950/20 border border-yellow-500/20 rounded-xl text-xs text-yellow-500/80">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>Ensure your IP access is restricted either to "Unrestricted" (not recommended) or wait for our static cluster IPs list. For MVP, please use unrestricted IP access on the API key settings.</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            Save Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
