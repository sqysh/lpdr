'use client'

import { SLIDES } from 'lib/constants/home.constants'
import { useCarousel } from 'lib/hooks/useCarousel.hook'
import { HeroBackground } from './HeroBackground'
import { SlideContent } from './SlideContent'
import { HeroMobileBar } from './HeroMobileBar'
import { HeroDesktopBar } from './HeroDesktopBar'
import { CarouselArrows } from './CarouselArrows'
import { AuctionStatus } from '@prisma/client'
import { useReducedMotion } from 'framer-motion'
import { useState } from 'react'

export type HeroAuction = {
  id: string
  title: string
  status: AuctionStatus
  // These arrive serialized once they cross to the client, so the type admits both
  startDate: Date | string | null
  endDate: Date | string | null
  customAuctionLink: string
  isPubliclyVisible: boolean
}

export const Hero = ({ auction }: { auction: HeroAuction | null }) => {
  const reduceMotion = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [stopped, setStopped] = useState(false)

  // Paused while pointed at, while focus is inside (so it can't move under a keyboard user), when
  // someone pressed pause, and always for reduced motion
  const paused = hovered || focused || stopped || !!reduceMotion

  const { current, goTo, goNext, goPrev } = useCarousel(SLIDES.length, { paused })
  const slide = SLIDES[current]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative w-full bg-bg-light dark:bg-bg-dark h-svh 1200:min-h-225 1200:h-full 1200:max-h-25 -mt-16 sm:-mt-33.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      <HeroBackground paused={stopped || !!reduceMotion} />
      <div className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto relative z-10 flex h-full min-h-[inherit] flex-col justify-between">
        <SlideContent slide={slide} index={current} total={SLIDES.length} />
        <div className="relative z-10 w-full bg-navbar-light dark:bg-navbar-dark">
          <HeroMobileBar
            current={current}
            goNext={goNext}
            goPrev={goPrev}
            goTo={goTo}
            hasEvent={!!auction}
            auction={auction}
            stopped={stopped}
            onToggleStopped={() => setStopped((s) => !s)}
          />
          <HeroDesktopBar
            current={current}
            goTo={goTo}
            hasEvent={!!auction}
            auction={auction}
            stopped={stopped}
            onToggleStopped={() => setStopped((s) => !s)}
          />
        </div>
      </div>
      <CarouselArrows goNext={goNext} goPrev={goPrev} />
    </section>
  )
}
