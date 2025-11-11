"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DialState {
  todayBudget: number;
  remaining: number;
  spent: number;
  lastCalculated: string;
}

interface Analytics {
  totalBalance: number;
  monthlySpending: number;
  spendingByCategory: Array<{ category: string; amount: number }>;
  dailySpending: Array<{ date: string; amount: number }>;
  upcomingBills: Array<{ id: string; name: string; amount: number; dueDate: string }>;
  dialState: DialState | null;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const dialState = analytics?.dialState;
  const progressValue = dialState
    ? Math.max(0, Math.min(100, (dialState.remaining / dialState.todayBudget) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">SpendDial</h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Transactions
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Categories
              </Link>
              <Link
                href="/bills"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Bills
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Dial State Card */}
          <div className="col-span-full lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-6">Today's Budget</h2>
              <div className="flex items-center justify-center">
                <div className="relative">
                  {/* SVG Dial */}
                  <svg className="w-64 h-64 -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="16"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      fill="none"
                      stroke={
                        progressValue > 50
                          ? "hsl(142, 76%, 36%)"
                          : progressValue > 25
                          ? "hsl(38, 92%, 50%)"
                          : "hsl(0, 84%, 60%)"
                      }
                      strokeWidth="16"
                      strokeDasharray={`${(progressValue / 100) * 628} 628`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold">
                      ${dialState?.remaining.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      remaining today
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                  <div className="text-sm text-muted-foreground">Budget</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${dialState?.todayBudget.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div className="rounded-lg bg-orange-50 dark:bg-orange-950 p-4">
                  <div className="text-sm text-muted-foreground">Spent</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${dialState?.spent.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Balance
              </h3>
              <div className="text-3xl font-bold mt-2">
                ${analytics?.totalBalance.toFixed(2) || "0.00"}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground">
                This Month
              </h3>
              <div className="text-3xl font-bold mt-2">
                ${analytics?.monthlySpending.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="col-span-full lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
              <div className="space-y-4">
                {analytics?.spendingByCategory.slice(0, 5).map((item) => {
                  const maxAmount = Math.max(
                    ...analytics.spendingByCategory.map((c) => c.amount)
                  );
                  const percentage = (item.amount / maxAmount) * 100;

                  return (
                    <div key={item.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.category}</span>
                        <span className="font-medium">
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {analytics?.spendingByCategory.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No transactions yet. Connect your bank to get started!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Bills</h2>
            <div className="space-y-3">
              {analytics?.upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{bill.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-semibold">${bill.amount.toFixed(2)}</div>
                </div>
              ))}
              {analytics?.upcomingBills.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming bills
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/onboarding"
            className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-2">Connect Bank</h3>
            <p className="text-sm text-muted-foreground">
              Link your bank account to track spending
            </p>
          </Link>

          <Link
            href="/transactions"
            className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-2">View Transactions</h3>
            <p className="text-sm text-muted-foreground">
              See all your recent transactions
            </p>
          </Link>

          <Link
            href="/categories"
            className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-2">Manage Categories</h3>
            <p className="text-sm text-muted-foreground">
              Set budgets for spending categories
            </p>
          </Link>

          <Link
            href="/bills"
            className="rounded-lg border bg-card p-6 hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-2">Add Bills</h3>
            <p className="text-sm text-muted-foreground">
              Track upcoming bills and payments
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
