'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { userApiKeys } from '@/db/schema';
import { encrypt } from '@/lib/crypto';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function saveApiKey(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const exchange = formData.get('exchange') as string;
  const apiKey = formData.get('apiKey') as string;
  const apiSecret = formData.get('apiSecret') as string;
  const passphrase = formData.get('passphrase') as string;

  if (!exchange || !apiKey || !apiSecret) {
    throw new Error('All fields are required');
  }

  // Encrypt sensitive fields
  const encryptedKey = encrypt(apiKey);
  const encryptedSecret = encrypt(apiSecret);
  const encryptedPassphrase = passphrase ? encrypt(passphrase) : null;

  // Check if key already exists for this exchange
  const existing = await db.select()
    .from(userApiKeys)
    .where(and(
      eq(userApiKeys.userClerkId, userId),
      eq(userApiKeys.exchange, exchange)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update
    await db.update(userApiKeys)
      .set({
        apiKey: encryptedKey,
        apiSecret: encryptedSecret,
        passphrase: encryptedPassphrase,
        updatedAt: new Date(),
      })
      .where(eq(userApiKeys.id, existing[0].id));
  } else {
    // Insert
    await db.insert(userApiKeys).values({
      userClerkId: userId,
      exchange,
      apiKey: encryptedKey,
      apiSecret: encryptedSecret,
      passphrase: encryptedPassphrase,
    });
  }

  revalidatePath('/dashboard/settings/api-keys');
}

export async function deleteApiKey(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  await db.delete(userApiKeys)
    .where(and(
      eq(userApiKeys.id, id),
      eq(userApiKeys.userClerkId, userId)
    ));

  revalidatePath('/dashboard/settings/api-keys');
}
