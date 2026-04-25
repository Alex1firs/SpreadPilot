"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

interface UpgradeButtonProps {
  planName: string;
  amount: number;
}

export function UpgradeButton({ planName, amount }: UpgradeButtonProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        body: JSON.stringify({ 
          email: user.primaryEmailAddress?.emailAddress,
          amount,
          plan: planName,
          userId: user.id
        }),
      });
      const data = await response.json();
      if (data.status && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        alert("Failed to initialize payment. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      Upgrade to {planName}
    </button>
  );
}
