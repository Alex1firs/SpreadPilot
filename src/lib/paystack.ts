export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
export const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || "";

export async function initializePayment(email: string, amount: number, plan: string, userId: string) {
  const url = "https://api.paystack.co/transaction/initialize";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Paystack uses kobo
      metadata: {
        userId,
        plan,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    }),
  });

  return await response.json();
}

export async function verifyPayment(reference: string) {
  const url = `https://api.paystack.co/transaction/verify/${reference}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });
  return await response.json();
}
