'use client'

import { SLIDES } from 'lib/constants/home.constants'
import { useCarousel } from 'lib/hooks/useCarousel.hook'
import { HeroBackground } from './HeroBackground'
import { SlideContent } from './SlideContent'
import { HeroMobileBar } from './HeroMobileBar'
import { HeroDesktopBar } from './HeroDesktopBar'
import { CarouselArrows } from './CarouselArrows'

export const Hero = () => {
  const { current, goTo, goNext, goPrev, setPaused } = useCarousel(SLIDES.length)
  const slide = SLIDES[current]

  // ToDo maybe
  const hasEvent = false

  return (
    <section
      aria-label="Hero carousel"
      className="relative w-full bg-bg-light dark:bg-bg-dark h-svh 1200:min-h-225 1200:h-full 1200:max-h-25 -mt-16 sm:-mt-33.5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <HeroBackground />
      <div className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto relative z-10 flex h-full min-h-[inherit] flex-col justify-between">
        <SlideContent slide={slide} />
        <div className="relative z-10 w-full bg-navbar-light dark:bg-navbar-dark border-t border-border-light dark:border-border-dark">
          <HeroMobileBar
            current={current}
            goNext={goNext}
            goPrev={goPrev}
            goTo={goTo}
            hasEvent={hasEvent}
          />
          <HeroDesktopBar current={current} goTo={goTo} hasEvent={hasEvent} />
        </div>
      </div>
      <CarouselArrows goNext={goNext} goPrev={goPrev} />
    </section>
  )
}
