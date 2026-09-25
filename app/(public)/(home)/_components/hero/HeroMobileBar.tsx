import { SLIDES } from 'lib/constants/home.constants'
import { AuctionCountdown } from './AuctionCountdown'
import { HeroAuction } from './Hero'
import { CarouselPauseButton } from './CarouselPauseButton'

export function HeroMobileBar({
  hasEvent,
  current,
  goTo,
  goPrev,
  goNext,
  auction,
  stopped,
  onToggleStopped
}: {
  hasEvent: boolean
  current: number
  goTo: (i: number) => void
  goPrev: () => void
  goNext: () => void
  auction: HeroAuction
  stopped: boolean
  onToggleStopped: () => void
}) {
  return (
    <div className="968:hidden">
      {/* Thin horizontal countdown */}
      <div className="border-b border-border-light dark:border-border-dark">
        {hasEvent ? <AuctionCountdown auction={auction} variant="horizontal" /> : null}
      </div>

      {/* Dots / counter / arrows row */}
      <div className="flex items-center justify-between gap-2 px-3 min-[400px]:px-4 py-3">
        <CarouselPauseButton stopped={stopped} onToggle={onToggleStopped} />

        {/* Dots */}
        <div className="flex items-center gap-1 shrink" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-current={i === current ? 'true' : undefined}
              aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
              onClick={() => goTo(i)}
              // The visible dot is tiny, so the button around it is 24px to be tappable
              className="w-6 h-6 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              {i === current ? (
                <span className="relative flex items-center justify-center w-4 h-4" aria-hidden="true">
                  <span className="absolute inset-0 border-2 border-primary-light dark:border-primary-dark" />
                  <span className="w-1.5 h-1.5 bg-primary-light dark:bg-primary-dark" />
                </span>
              ) : (
                <span className="w-1.5 h-1.5 bg-muted-light/40 dark:bg-on-dark/40 transition-colors" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>

        {/* Counter */}
        <span
          className="hidden min-[360px]:inline text-[10px] font-mono tracking-eyebrow tabular-nums text-muted-light dark:text-muted-dark shrink-0"
          aria-hidden="true"
        >
          {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </span>

        {/* Prev / Next */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={goPrev}
            type="button"
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
            type="button"
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
