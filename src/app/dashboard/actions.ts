'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { autoPilotSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function toggleAutoPilot(enabled: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const existing = await db.select()
    .from(autoPilotSettings)
    .where(eq(autoPilotSettings.userClerkId, userId))
    .limit(1);

  if (existing.length > 0) {
    await db.update(autoPilotSettings)
      .set({ isEnabled: enabled, updatedAt: new Date() })
      .where(eq(autoPilotSettings.userClerkId, userId));
  } else {
    await db.insert(autoPilotSettings).values({
      userClerkId: userId,
      isEnabled: enabled,
    });
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateAutoPilotConfig(maxSize: number, minProfit: number) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.update(autoPilotSettings)
    .set({ 
      maxTradeSizeUsdt: maxSize.toString(),
      minProfitPercent: minProfit.toString(),
      updatedAt: new Date() 
    })
    .where(eq(autoPilotSettings.userClerkId, userId));

  revalidatePath('/dashboard');
  return { success: true };
}
