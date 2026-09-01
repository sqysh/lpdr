export function PublicDonateSkeleton() {
  return (
    <>
      {/* ── Thin sticky header ── */}
      <header className="sticky top-0 z-50 bg-topbar-light/95 dark:bg-topbar-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <div className="max-w-5xl mx-auto w-full px-4 1150:px-0 h-12 flex items-center justify-between">
          <div className="h-2.5 w-14 bg-surface-light dark:bg-surface-dark" />
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-32 bg-surface-light dark:bg-surface-dark" />
            <div className="w-7 h-7 bg-surface-light dark:bg-surface-dark" />
          </div>
        </div>
      </header>

      <main className="min-h-dvh px-4 1150:px-0 pt-12 sm:pt-16 pb-24 sm:pb-32 bg-bg-light dark:bg-bg-dark flex flex-col gap-y-20 sm:gap-y-28 animate-pulse">
        <div className="max-w-5xl mx-auto w-full">
          {/* ── Page header ── */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="block w-8 h-px bg-border-light dark:bg-border-dark"
                aria-hidden="true"
              />
              <div className="h-2.5 w-28 bg-surface-light dark:bg-surface-dark" />
            </div>
            <div className="h-11 sm:h-14 w-3/4 sm:w-1/2 bg-surface-light dark:bg-surface-dark mb-5" />
            <div className="h-4 w-full max-w-xl bg-surface-light dark:bg-surface-dark" />
          </div>

          {/* ── Two-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-12 items-start">
            {/* ── LEFT PANEL ── */}
            <aside className="lg:sticky lg:top-8 space-y-8">
              {/* Mission */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="block w-5 h-px bg-border-light dark:bg-border-dark"
                    aria-hidden="true"
                  />
                  <div className="h-2.5 w-20 bg-surface-light dark:bg-surface-dark" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-surface-light dark:bg-surface-dark" />
                  <div className="h-3 w-full bg-surface-light dark:bg-surface-dark" />
                  <div className="h-3 w-2/3 bg-surface-light dark:bg-surface-dark" />
                </div>
              </div>

              <div className="h-px bg-border-light dark:bg-border-dark" />

              {/* Impact stats */}
              <div>
                <div className="h-2.5 w-20 bg-surface-light dark:bg-surface-dark mb-5" />
                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-baseline gap-4">
                      <div className="h-7 w-16 bg-surface-light dark:bg-surface-dark shrink-0" />
                      <div className="h-3 w-40 bg-surface-light dark:bg-surface-dark" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border-light dark:bg-border-dark" />

              {/* Where it goes */}
              <div>
                <div className="h-2.5 w-24 bg-surface-light dark:bg-surface-dark mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-4 w-10 bg-surface-light dark:bg-surface-dark shrink-0" />
                      <div className="h-3 w-48 bg-surface-light dark:bg-surface-dark" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── RIGHT PANEL — form skeleton ── */}
            <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 space-y-6">
              {/* Amount selector */}
              <div>
                <div className="h-2.5 w-24 bg-border-light dark:bg-border-dark mb-3" />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark"
                    />
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div>
                <div className="h-2.5 w-32 bg-border-light dark:bg-border-dark mb-2" />
                <div className="h-11 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark" />
              </div>

              {/* Total row */}
              <div className="h-14 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark" />

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="h-2.5 w-16 bg-border-light dark:bg-border-dark mb-2" />
                  <div className="h-11 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark" />
                </div>
                <div>
                  <div className="h-2.5 w-16 bg-border-light dark:bg-border-dark mb-2" />
                  <div className="h-11 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark" />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="h-2.5 w-28 bg-border-light dark:bg-border-dark mb-2" />
                <div className="h-11 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark" />
              </div>

              {/* Card details */}
              <div>
                <div className="h-2.5 w-24 bg-border-light dark:bg-border-dark mb-2" />
                <div className="h-11 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark" />
              </div>

              {/* Toggles */}
              <div className="h-14 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark" />
              <div className="h-14 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark" />

              {/* Submit button */}
              <div className="h-12 bg-border-light dark:bg-border-dark" />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
