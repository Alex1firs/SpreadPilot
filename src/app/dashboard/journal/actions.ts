"use server";

import { db } from "@/db";
import { tradeJournal, userGoals } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function logTrade(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const buyExchange = formData.get("buyExchange") as string;
  const sellExchange = formData.get("sellExchange") as string;
  const volumeUsdt = formData.get("volumeUsdt") as string;
  const buyPrice = formData.get("buyPrice") as string;
  const sellPrice = formData.get("sellPrice") as string;
  const notes = formData.get("notes") as string;

  const totalCostNgn = parseFloat(volumeUsdt) * parseFloat(buyPrice);
  const totalReturnNgn = parseFloat(volumeUsdt) * parseFloat(sellPrice);
  const netProfitNgn = totalReturnNgn - totalCostNgn;

  await db.insert(tradeJournal).values({
    userClerkId: userId,
    buyExchange,
    sellExchange,
    volumeUsdt,
    buyPrice,
    sellPrice,
    totalCostNgn: totalCostNgn.toString(),
    totalReturnNgn: totalReturnNgn.toString(),
    netProfitNgn: netProfitNgn.toString(),
    status: "Completed",
    notes,
  });

  revalidatePath("/dashboard/journal");
  revalidatePath("/dashboard");
}

export async function updateGoals(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const dailyProfitTarget = formData.get("dailyProfitTarget") as string;
  const weeklyProfitTarget = formData.get("weeklyProfitTarget") as string;

  await db.insert(userGoals).values({
    userClerkId: userId,
    dailyProfitTarget,
    weeklyProfitTarget,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: [userGoals.userClerkId],
    set: {
      dailyProfitTarget,
      weeklyProfitTarget,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
