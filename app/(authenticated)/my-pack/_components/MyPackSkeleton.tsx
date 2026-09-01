export function MyPackSkeleton() {
  return (
    <main className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* TopBar */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-3 w-16 bg-border-light dark:bg-border-dark animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-3 w-20 bg-border-light dark:bg-border-dark animate-pulse" />
            <div className="h-3 w-16 bg-border-light dark:bg-border-dark animate-pulse" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-start gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-border-light dark:bg-border-dark animate-pulse shrink-0" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-5 h-px bg-border-light dark:bg-border-dark" />
                <div className="h-2.5 w-24 bg-border-light dark:bg-border-dark animate-pulse" />
              </div>
              <div className="h-8 w-48 bg-border-light dark:bg-border-dark animate-pulse mb-2" />
              <div className="h-3 w-36 bg-border-light dark:bg-border-dark animate-pulse" />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="border border-border-light dark:border-border-dark divide-y divide-border-light dark:divide-border-dark mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              <div className="space-y-1.5">
                <div className="h-2.5 w-40 bg-border-light dark:bg-border-dark animate-pulse" />
                <div className="h-2 w-64 bg-border-light dark:bg-border-dark animate-pulse" />
              </div>
              <div className="w-10 h-5 bg-border-light dark:bg-border-dark animate-pulse shrink-0 ml-4" />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="border border-border-light dark:border-border-dark grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-border-light dark:divide-border-dark">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-5 py-4 space-y-2">
              <div className="h-2.5 w-20 bg-border-light dark:bg-border-dark animate-pulse" />
              <div className="h-7 w-16 bg-border-light dark:bg-border-dark animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
