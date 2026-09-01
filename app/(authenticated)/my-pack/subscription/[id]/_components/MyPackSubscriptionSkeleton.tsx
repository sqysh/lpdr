export function MyPackSubscriptionSkeleton() {
  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <div className="mb-10">
          <div className="h-3 w-20 bg-surface-light dark:bg-surface-dark mb-8" />
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-6 h-px bg-border-light dark:bg-border-dark shrink-0" />
            <div className="h-2.5 w-24 bg-surface-light dark:bg-surface-dark" />
          </div>
          <div className="h-10 w-64 bg-surface-light dark:bg-surface-dark" />
        </div>

        {/* ── Overview card ── */}
        <div className="border border-border-light dark:border-border-dark mb-6 animate-pulse">
          <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <div className="h-2.5 w-16 bg-border-light dark:bg-border-dark" />
          </div>
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-4">
                <div className="h-2.5 w-20 bg-surface-light dark:bg-surface-dark" />
                <div className="h-2.5 w-24 bg-surface-light dark:bg-surface-dark" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
