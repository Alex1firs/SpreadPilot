import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const PLANS = {
  FREE: "Free",
  PRO: "Pro",
  PREMIUM: "Premium",
};

export async function getUserSubscription(userId: string) {
  const result = await db.select()
    .from(subscriptions)
    .where(eq(subscriptions.userClerkId, userId))
    .limit(1);
  
  const sub = result[0];
  
  if (!sub) return { plan: PLANS.FREE, status: "active" };

  // Check for expiration
  const now = new Date();
  if (sub.endDate && now > sub.endDate) {
    return { plan: PLANS.FREE, status: "expired" };
  }
  
  return sub;
}

export function canAccessProFeatures(plan: string) {
  return plan === PLANS.PRO || plan === PLANS.PREMIUM;
}

export function canAccessPremiumFeatures(plan: string) {
  return plan === PLANS.PREMIUM;
}
