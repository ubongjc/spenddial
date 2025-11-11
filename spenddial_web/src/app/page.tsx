import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  // If authenticated, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">SpendDial</div>
            <div className="flex gap-4">
              <Link
                href="/sign-in"
                className="text-sm font-medium hover:text-primary"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Know Exactly How Much You Can Spend Today
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          SpendDial auto-calculates your daily discretionary budget by tracking spending,
          predicting bills, and teaching healthy pacing—without spreadsheets.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start Free Trial
          </Link>
          <Link
            href="#features"
            className="rounded-lg border border-primary px-8 py-4 text-lg font-medium text-primary hover:bg-primary/10"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Three simple steps to financial clarity
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-8 text-center">
            <div className="text-4xl mb-4">🏦</div>
            <h3 className="text-xl font-semibold mb-3">Connect Your Bank</h3>
            <p className="text-muted-foreground">
              Securely link your accounts with bank-level encryption. Read-only access ensures
              your money stays safe.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Set Up Bills & Categories</h3>
            <p className="text-muted-foreground">
              Add recurring bills and spending categories. SpendDial learns your patterns and
              predicts upcoming expenses.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-8 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-3">See Your Daily Budget</h3>
            <p className="text-muted-foreground">
              Watch your dial update in real-time. Always know exactly how much you can spend
              today without overspending.
            </p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to master your spending
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-2">🔄 Auto-Sync Transactions</h3>
              <p className="text-sm text-muted-foreground">
                Automatic daily syncing of all your transactions across linked accounts
              </p>
            </div>

            <div className="rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-2">📊 Smart Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Beautiful charts and insights into your spending patterns
              </p>
            </div>

            <div className="rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-2">🔔 Bill Predictions</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered predictions for recurring bills and upcoming expenses
              </p>
            </div>

            <div className="rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-2">📱 Mobile & Web</h3>
              <p className="text-sm text-muted-foreground">
                Beautiful native iOS app plus responsive web dashboard
              </p>
            </div>

            <div className="rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-2">🔐 Passkey Security</h3>
              <p className="text-sm text-muted-foreground">
                Passwordless authentication with WebAuthn for maximum security
              </p>
            </div>

            <div className="rounded-lg bg-card p-6">
              <h3 className="font-semibold mb-2">🎨 Custom Categories</h3>
              <p className="text-sm text-muted-foreground">
                Create unlimited categories with custom budgets and visual themes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="rounded-lg border bg-card p-8">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-4">$0<span className="text-lg font-normal">/month</span></div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>1 bank account</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Daily budget dial</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Mobile app access</span>
              </li>
            </ul>
            <Link
              href="/sign-up"
              className="block rounded-lg border border-primary px-6 py-3 text-center font-medium text-primary hover:bg-primary/10"
            >
              Get Started
            </Link>
          </div>

          <div className="rounded-lg border-2 border-primary bg-card p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Plus</h3>
            <div className="text-4xl font-bold mb-4">$9<span className="text-lg font-normal">/month</span></div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Unlimited accounts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Bill predictions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Custom categories</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            <Link
              href="/sign-up"
              className="block rounded-lg bg-primary px-6 py-3 text-center font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="font-bold text-lg mb-4">SpendDial</div>
              <p className="text-sm text-muted-foreground">
                Live dial of discretionary spend left today
              </p>
            </div>
            <div>
              <div className="font-semibold mb-4">Product</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="/sign-up">Get Started</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Company</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Legal</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 SpendDial. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
