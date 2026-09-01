export function CarouselArrows({ goPrev, goNext }: { goPrev: () => void; goNext: () => void }) {
  return (
    <div className="hidden 1200:flex absolute left-0 right-0 top-1/2 z-20 -translate-y-1/2 justify-between px-2 sm:px-4">
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="flex h-11 w-11 items-center justify-center border border-border-light dark:border-border-dark bg-surface-light/60 dark:bg-surface-dark/60 text-text-light dark:text-on-dark hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-bg-dark hover:border-transparent backdrop-blur-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="flex h-11 w-11 items-center justify-center border border-border-light dark:border-border-dark bg-surface-light/60 dark:bg-surface-dark/60 text-text-light dark:text-on-dark hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-bg-dark hover:border-transparent backdrop-blur-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
