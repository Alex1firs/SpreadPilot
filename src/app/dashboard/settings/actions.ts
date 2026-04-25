"use server";

import { db } from "@/db";
import { alertSettings } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveAlertSettings(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  const alertsEnabled = formData.get("alertsEnabled") === "on";
  const telegramChatId = formData.get("telegramChatId")?.toString() || null;
  const minSpread = formData.get("minSpread")?.toString() || "1.5";
  const minProfit = formData.get("minProfit")?.toString() || "5000";
  const maxRiskLevel = formData.get("maxRiskLevel")?.toString() || "Medium";

  try {
    const existing = await db.select().from(alertSettings).where(eq(alertSettings.userClerkId, userId));
    
    if (existing.length > 0) {
      await db.update(alertSettings)
        .set({
          alertsEnabled,
          telegramChatId,
          minSpread,
          minProfit,
          maxRiskLevel,
          updatedAt: new Date()
        })
        .where(eq(alertSettings.userClerkId, userId));
    } else {
      await db.insert(alertSettings).values({
        userClerkId: userId,
        alertsEnabled,
        telegramChatId,
        minSpread,
        minProfit,
        maxRiskLevel
      });
    }

    revalidatePath("/dashboard/settings");
    return { success: true, message: "Settings saved successfully!" };
  } catch (error) {
    console.error("Failed to save settings:", error);
    return { error: "Failed to save settings. Please try again." };
  }
}
