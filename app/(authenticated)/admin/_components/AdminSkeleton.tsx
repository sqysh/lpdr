type Props = {
  columns?: number
  rows?: number
  hasToolbar?: boolean
}

export function AdminSkeleton({ columns = 4, rows = 8, hasToolbar = true }: Props) {
  return (
    <main className="min-h-screen w-full bg-bg-light dark:bg-bg-dark animate-pulse">
      {/* ── Header (mirrors AdminPageHeader) ── */}
      <header className="sticky top-0 z-10 w-full border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 h-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-16 bg-surface-light dark:bg-surface-dark" />
          <div className="h-2 w-2.5 bg-surface-light dark:bg-surface-dark" />
          <div className="h-2.5 w-14 bg-surface-light dark:bg-surface-dark" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-16 bg-surface-light dark:bg-surface-dark hidden sm:block" />
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        {/* ── Toolbar (search + filter tabs) ── */}
        {hasToolbar && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="h-9 w-full sm:max-w-xs bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-20 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Table (mirrors AdminTable) ── */}
        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden">
          <div className="border-b border-border-light dark:border-border-dark px-4 py-2.5 flex gap-6">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-2.5 w-16 bg-bg-light dark:bg-bg-dark" />
            ))}
          </div>
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="px-4 py-3 flex items-center gap-6">
                {Array.from({ length: columns }).map((_, c) => (
                  <div
                    key={c}
                    className="h-3 bg-bg-light dark:bg-bg-dark"
                    style={{ width: c === 0 ? '40%' : `${60 / columns}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-32 bg-surface-light dark:bg-surface-dark" />
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-7 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
