export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4">You're Offline</h1>

        <p className="text-muted-foreground mb-8">
          It looks like you've lost your internet connection. SpendDial needs an active
          connection to sync your transactions and update your budget.
        </p>

        <div className="rounded-lg border bg-card p-6 mb-8 text-left">
          <h2 className="font-semibold mb-2">What you can do:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>View previously cached pages if available</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry Connection
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full rounded-lg border px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            Go Back
          </button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Your data will automatically sync when you're back online.
        </p>
      </div>
    </div>
  );
}
