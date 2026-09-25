import { SLIDES } from 'lib/constants/home.constants'
import { AuctionCountdown } from './AuctionCountdown'
import { VideoThumb } from './VideoThumb'
import { HeroAuction } from './Hero'
import { CarouselPauseButton } from './CarouselPauseButton'

type Props = {
  hasEvent: boolean
  current: number
  goTo: (i: number) => void
  auction: HeroAuction
  stopped: boolean
  onToggleStopped: () => void
}

export function HeroDesktopBar({ hasEvent, current, goTo, auction, stopped, onToggleStopped }: Props) {
  return (
    <div className="hidden 968:block">
      <div className="absolute left-0 bottom-0 1200:-bottom-10 w-70 1200:w-117.25 h-42.5 1200:h-55 bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-sm overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          {hasEvent ? (
            <div className="px-6">
              <AuctionCountdown auction={auction} />
            </div>
          ) : (
            <VideoThumb />
          )}
        </div>
      </div>

      {/* Everything in this bar is positioned absolutely, so the pause button lives inside here rather than
          in the flow, where it would give the wrapper a height and push the bar out of line */}
      <div
        className="absolute bottom-0 1200:-bottom-10 left-70 1200:left-117.25 z-20 flex items-center gap-5 bg-navbar-light dark:bg-navbar-dark px-10 py-12.5 w-[calc(100%-280px)] 1200:w-107.5"
        aria-label="Slides"
      >
        <CarouselPauseButton stopped={stopped} onToggle={onToggleStopped} />

        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-current={i === current ? 'true' : undefined}
            aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
            onClick={() => goTo(i)}
            className="w-6 h-6 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark cursor-pointer"
          >
            {i === current ? (
              <span className="relative flex items-center justify-center w-5 h-5" aria-hidden="true">
                <span className="absolute inset-0 border-2 border-primary-light dark:border-primary-dark" />
                <span className="w-2 h-2 bg-primary-light dark:bg-primary-dark" />
              </span>
            ) : (
              <span className="w-2 h-2 bg-muted-light/40 dark:bg-on-dark/40 transition-colors" aria-hidden="true" />
            )}
          </button>
        ))}

        <span className="w-16 mx-2 h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />
        <span className="text-muted-light dark:text-muted-dark text-[10px] font-mono tracking-eyebrow tabular-nums" aria-hidden="true">
          {current + 1}/{SLIDES.length}
        </span>
      </div>
    </div>
  )
}
