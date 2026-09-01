import { SLIDES } from 'lib/constants/home.constants'
import { EventCountdown } from './EventCountdown'
import { VideoThumb } from './VideoThumb'

export function HeroDesktopBar({
  hasEvent,
  current,
  goTo
}: {
  hasEvent: boolean
  current: number
  goTo: (i: number) => void
}) {
  return (
    <div className="hidden 968:block">
      <div className="absolute left-0 bottom-0 1200:-bottom-10 w-70 1200:w-117.25 h-42.5 1200:h-55 bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-sm dark:border-border-dark overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          {hasEvent ? (
            <div className="px-6">
              <EventCountdown />
            </div>
          ) : (
            <VideoThumb />
          )}
        </div>
      </div>

      {/* Dot indicators */}
      <div
        className="absolute bottom-0 1200:-bottom-10 left-70 1200:left-117.25 z-20 flex items-center gap-10 bg-navbar-light dark:bg-navbar-dark dark:border-border-dark px-17.5 py-12.5 flex-1 w-[calc(100%-280px)] 1200:w-107.5"
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
            className="relative flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark cursor-pointer"
          >
            {i === current ? (
              <span
                className="relative flex items-center justify-center w-5 h-5"
                aria-hidden="true"
              >
                <span className="absolute inset-0  border-2 border-primary-light dark:border-primary-dark" />
                <span className="w-2 h-2  bg-primary-light dark:bg-primary-dark" />
              </span>
            ) : (
              <span
                className="w-2 h-2  bg-muted-light/40 dark:bg-on-dark/40 hover:bg-primary-light dark:hover:bg-primary-dark transition-colors"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
        <span className="w-16 mx-2 h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />
        <span
          className="text-muted-light dark:text-muted-dark text-[10px] font-mono tracking-[0.2em] tabular-nums"
          aria-live="polite"
          aria-atomic="true"
        >
          {current + 1}/{SLIDES.length}
        </span>
      </div>
    </div>
  )
}
