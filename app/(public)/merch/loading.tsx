export default function Loading() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
      aria-busy="true"
      aria-label="Loading store"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
            <p className="text-xs font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">LPDR Store</p>
          </div>
          <div className="h-11 sm:h-14 w-64 sm:w-80 bg-surface-light dark:bg-surface-dark animate-pulse mb-3" />
          <div className="space-y-2 max-w-md">
            <div className="h-3 w-full bg-surface-light dark:bg-surface-dark animate-pulse" />
            <div className="h-3 w-3/4 bg-surface-light dark:bg-surface-dark animate-pulse" />
          </div>
        </div>

        {/* ── Count ── */}
        <div className="h-3 w-40 bg-surface-light dark:bg-surface-dark animate-pulse mb-6" aria-hidden="true" />

        {/* ── Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border-light dark:border-border-dark overflow-hidden">
              {/* Product image */}
              <div className="aspect-square bg-surface-light dark:bg-surface-dark animate-pulse" />
              {/* Body */}
              <div className="p-4 space-y-3">
                {/* Name */}
                <div className="h-4 w-3/4 bg-surface-light dark:bg-surface-dark animate-pulse" />
                {/* Price */}
                <div className="h-4 w-1/3 bg-surface-light dark:bg-surface-dark animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        Loading products…
      </span>
    </main>
  )
}
