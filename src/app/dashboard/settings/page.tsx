import { Lock } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/db';
import { alertSettings, userGoals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { AlertSettingsForm } from './form';
import { GoalSettingsForm } from './GoalSettingsForm';

import { getUserSubscription, canAccessProFeatures } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { userId } = await auth();
  const sub = await getUserSubscription(userId || '');
  const isPro = canAccessProFeatures(sub.plan);

  let userSettings = null;
  let userGoal = null;

  if (userId) {
    const alertRecords = await db.select().from(alertSettings).where(eq(alertSettings.userClerkId, userId));
    if (alertRecords.length > 0) userSettings = alertRecords[0];

    const goalRecords = await db.select().from(userGoals).where(eq(userGoals.userClerkId, userId));
    if (goalRecords.length > 0) userGoal = goalRecords[0];
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">Manage your alert preferences and account settings.</p>
      </div>

      <AlertSettingsForm initialData={userSettings} isPro={isPro} />
      <GoalSettingsForm initialData={userGoal} isPro={isPro} />

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <Lock className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-white">Security & Account</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-6">Manage your authentication and profile details via Clerk.</p>
          <Link href="/dashboard/settings/profile" className="inline-block border border-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Manage Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
