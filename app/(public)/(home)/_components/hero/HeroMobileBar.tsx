import { SLIDES } from 'lib/constants/home.constants'
import { EventCountdown } from './EventCountdown'

export function HeroMobileBar({
  hasEvent,
  current,
  goTo,
  goPrev,
  goNext
}: {
  hasEvent: boolean
  current: number
  goTo: (i: number) => void
  goPrev: () => void
  goNext: () => void
}) {
  return (
    <div className="968:hidden">
      {/* Thin horizontal countdown */}
      <div className="border-b border-border-light dark:border-border-dark">
        {hasEvent ? <EventCountdown variant="horizontal" /> : <></>}
      </div>

      {/* Dots / counter / arrows row */}
      <div className="flex items-center justify-between gap-2 px-3 min-[400px]:px-4 py-3">
        {/* Dots */}
        <div
          className="flex items-center gap-2 min-[400px]:gap-3 shrink"
          role="tablist"
          aria-label="Slide indicators"
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="relative flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              {i === current ? (
                <span
                  className="relative flex items-center justify-center w-4 h-4"
                  aria-hidden="true"
                >
                  <span className="absolute inset-0 border-2 border-primary-light dark:border-primary-dark" />
                  <span className="w-1.5 h-1.5 bg-primary-light dark:bg-primary-dark" />
                </span>
              ) : (
                <span
                  className="w-1.5 h-1.5 bg-muted-light/40 dark:bg-on-dark/40 hover:bg-primary-light dark:hover:bg-primary-dark transition-colors"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>

        {/* Counter */}
        <span
          className="hidden min-[360px]:inline text-[10px] font-mono tracking-[0.2em] tabular-nums text-muted-light dark:text-muted-dark shrink-0"
          aria-live="polite"
          aria-atomic="true"
        >
          {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </span>

        {/* Prev / Next */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={goPrev}
            aria-label="Previous slide"
            className="w-8 h-8 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <svg
              width="13"
              height="13"
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
            className="w-8 h-8 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <svg
              width="13"
              height="13"
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
      </div>
    </div>
  )
}
