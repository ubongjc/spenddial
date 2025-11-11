"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";

export default function OnboardingPage() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    createLinkToken();
  }, []);

  const createLinkToken = async () => {
    try {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setLinkToken(data.link_token);
      }
    } catch (error) {
      console.error("Failed to create link token:", error);
    } finally {
      setLoading(false);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_token,
            institution: metadata.institution,
          }),
        });

        if (response.ok) {
          router.push("/dashboard");
        } else {
          alert("Failed to connect bank account");
        }
      } catch (error) {
        console.error("Failed to exchange token:", error);
        alert("Failed to connect bank account");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to SpendDial</h1>
            <p className="text-lg text-muted-foreground">
              Let's get your account set up in just a few steps
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Connect Your Bank</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Securely link your bank account to automatically track spending
                  </p>
                  <button
                    onClick={() => open()}
                    disabled={!ready || loading}
                    className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : "Connect Bank Account"}
                  </button>
                  <p className="mt-3 text-xs text-muted-foreground">
                    🔒 Bank-level encryption · Read-only access · No transfer permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border bg-card p-6 opacity-50">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Set Up Categories</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize your spending with custom categories and budgets
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border bg-card p-6 opacity-50">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Add Recurring Bills</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your bills so SpendDial can calculate your daily budget
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Skip for now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
