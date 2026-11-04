export default function Loading() {
  return (
    <section
      aria-labelledby="adopt-loading-heading"
      className="bg-bg-light dark:bg-bg-dark py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
      aria-busy="true"
    >
      <div className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
            <p
              id="adopt-loading-heading"
              className="text-xs font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark"
            >
              Available Now
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="h-9 sm:h-10 w-72 sm:w-96 bg-surface-light dark:bg-surface-dark animate-pulse" />
            <div className="h-4 w-28 bg-surface-light dark:bg-surface-dark animate-pulse" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden aspect-3/4 bg-surface-light dark:bg-surface-dark animate-pulse">
              {/* Label block anchored bottom-left, matching DogCard */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 space-y-2">
                <div className="h-2.5 w-6 bg-bg-light/40 dark:bg-bg-dark/40" />
                <div className="h-4 w-2/3 bg-bg-light/50 dark:bg-bg-dark/50" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        Loading available dachshunds…
      </span>
    </section>
  )
}
