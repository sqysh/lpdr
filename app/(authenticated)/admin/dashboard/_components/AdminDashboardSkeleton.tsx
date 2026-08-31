export function AdminDashboardSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* ── Header ── */}
      <div className="border-b border-border-light dark:border-border-dark px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <div className="h-3 w-20 bg-surface-light dark:bg-surface-dark" />
          <div className="h-2.5 w-28 bg-surface-light dark:bg-surface-dark" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 bg-surface-light dark:bg-surface-dark" />
          <div className="w-4 h-4 bg-surface-light dark:bg-surface-dark" />
        </div>
      </div>

      {/* ── Pending shipments (optional section) ── */}
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark mb-5">
        <div className="px-5 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <div className="h-3 w-40 bg-bg-light dark:bg-bg-dark" />
          <div className="h-2.5 w-16 bg-bg-light dark:bg-bg-dark" />
        </div>
        <div className="divide-y divide-border-light dark:divide-border-dark">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-start justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0 space-y-1.5 flex-1">
                <div className="h-3 w-32 bg-bg-light dark:bg-bg-dark" />
                <div className="h-2.5 w-48 bg-bg-light dark:bg-bg-dark" />
                <div className="h-2.5 w-56 bg-bg-light dark:bg-bg-dark" />
              </div>
              <div className="shrink-0 text-right space-y-1.5">
                <div className="h-3 w-14 bg-bg-light dark:bg-bg-dark ml-auto" />
                <div className="h-2.5 w-10 bg-bg-light dark:bg-bg-dark ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 pb-12 space-y-5">
        {/* ── Hero revenue row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* Total revenue */}
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 sm:p-6">
            <div className="h-2.5 w-32 bg-bg-light dark:bg-bg-dark mb-3" />
            <div className="flex items-end justify-between gap-4">
              <div className="h-11 sm:h-12 w-48 bg-bg-light dark:bg-bg-dark" />
              <div className="text-right space-y-1.5">
                <div className="h-2 w-16 bg-bg-light dark:bg-bg-dark ml-auto" />
                <div className="h-3 w-20 bg-bg-light dark:bg-bg-dark ml-auto" />
              </div>
            </div>
            <div className="h-3 w-40 bg-bg-light dark:bg-bg-dark mt-4" />
          </div>

          {/* Quick stat pair */}
          <div className="grid grid-cols-2 gap-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 flex flex-col justify-between"
              >
                <div className="h-2.5 w-20 bg-bg-light dark:bg-bg-dark" />
                <div className="space-y-1.5">
                  <div className="h-7 w-14 bg-bg-light dark:bg-bg-dark" />
                  <div className="h-2.5 w-24 bg-bg-light dark:bg-bg-dark" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Revenue by source (donut + legend) ── */}
        <div>
          <div className="h-2.5 w-32 bg-surface-light dark:bg-surface-dark mb-2.5" />
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="w-40 h-40 rounded-full border-[22px] border-bg-light dark:border-bg-dark shrink-0" />
              <div className="w-full space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-bg-light dark:bg-bg-dark shrink-0" />
                    <div className="h-2.5 flex-1 bg-bg-light dark:bg-bg-dark" />
                    <div className="h-2.5 w-8 bg-bg-light dark:bg-bg-dark" />
                    <div className="h-3 w-14 bg-bg-light dark:bg-bg-dark" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Top Supporters + Top Products ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, col) => (
            <div
              key={col}
              className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5"
            >
              <div className="h-2.5 w-28 bg-bg-light dark:bg-bg-dark mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-bg-light dark:bg-bg-dark shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-28 bg-bg-light dark:bg-bg-dark" />
                      <div className="h-2 w-20 bg-bg-light dark:bg-bg-dark" />
                    </div>
                    <div className="h-3 w-12 bg-bg-light dark:bg-bg-dark" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Welcome Wieners ── */}
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 sm:p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="h-2.5 w-28 bg-bg-light dark:bg-bg-dark" />
            <div className="h-2.5 w-20 bg-bg-light dark:bg-bg-dark" />
          </div>
          <div className="h-2.5 w-44 bg-bg-light dark:bg-bg-dark mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-3 w-20 bg-bg-light dark:bg-bg-dark" />
                  <div className="h-2.5 w-24 bg-bg-light dark:bg-bg-dark" />
                </div>
                <div className="h-2 w-full bg-bg-light dark:bg-bg-dark" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
