import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const payload = await req.text();
  const body = JSON.parse(payload);
  const signature = req.headers.get("x-paystack-signature");
  
  // Verify signature
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex");
  
  if (hash !== signature) {
    console.error("❌ Paystack Webhook: Invalid Signature");
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  const { event, data } = body;

  if (event === "charge.success") {
    const { userId, plan } = data.metadata;
    const customerId = data.customer.customer_code;
    
    // Calculate end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await db.insert(subscriptions).values({
      userClerkId: userId,
      plan: plan,
      status: "active",
      startDate: new Date(),
      endDate: endDate,
      paystackCustomerId: customerId,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: [subscriptions.userClerkId],
      set: {
        plan: plan,
        status: "active",
        endDate: endDate,
        paystackCustomerId: customerId,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Subscription activated for user ${userId} (Plan: ${plan})`);
  }

  return NextResponse.json({ message: "Success" });
}
