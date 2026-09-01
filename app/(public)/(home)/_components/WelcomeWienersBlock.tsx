'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { IWelcomeWiener } from 'types/_welcome-wiener'
import Picture from 'app/components/_common/Picture'

export const WelcomeWienersBlock = ({ data }: { data: IWelcomeWiener[] }) => {
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const scrollRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftOffset, setLeftOffset] = useState(0)
  const dachshunds = data ?? []

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setLeftOffset(containerRef.current.getBoundingClientRect().left)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const getCardWidth = useCallback(() => {
    const el = scrollRef.current
    if (!el) return 0
    const firstCard = el.querySelector('li[data-card]') as HTMLElement
    if (!firstCard) return 0
    return firstCard.getBoundingClientRect().width + 12
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      setAtStart(el.scrollLeft <= 0)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const prev = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: el.scrollLeft - getCardWidth(), behavior: 'smooth' })
  }, [getCardWidth])

  const next = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: el.scrollLeft + getCardWidth(), behavior: 'smooth' })
  }, [getCardWidth])

  if (!dachshunds.length) {
    return (
      <section
        aria-labelledby="welcome-wieners-heading"
        className="relative w-full bg-bg-light dark:bg-bg-dark px-4 xs:px-5 sm:px-6 lg:px-8 py-16"
      >
        <div className="max-w-300 mx-auto">
          <div className="flex items-center gap-3 mb-4" aria-hidden="true">
            <div className="w-6 sm:w-8 h-px bg-primary-light dark:bg-primary-dark" />
            <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Welcome Wieners
            </p>
          </div>
          <h2
            id="welcome-wieners-heading"
            className="font-quicksand font-black text-[2rem] text-text-light dark:text-text-dark mb-4"
          >
            No Dogs in Our Care Right Now
          </h2>
          <p className="font-nunito text-muted-light dark:text-muted-dark mb-8 max-w-md leading-relaxed text-sm">
            All of our Welcome Wieners have found homes. Check back soon or make a general donation to support our next
            rescue.
          </p>
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark text-sm font-mono tracking-[0.2em] uppercase hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            Make a Donation
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="welcome-wieners-heading"
      className="relative w-full overflow-hidden bg-bg-light dark:bg-bg-dark pb-16"
    >
      <div className="px-4 xs:px-5 sm:px-6 lg:px-8">
        <div ref={containerRef} className="relative max-w-300 mx-auto">
          {/* Header */}
          <div className="flex flex-col xs:flex-row xs:items-end justify-between mb-7 sm:mb-10 lg:mb-14 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3" aria-hidden="true">
                <div className="w-6 sm:w-8 h-px bg-primary-light dark:bg-primary-dark shrink-0" />
                <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                  Welcome Wieners
                </p>
              </div>
              <h2
                id="welcome-wieners-heading"
                className="font-quicksand leading-tight text-text-light dark:text-text-dark"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
              >
                <span className="font-black block">DOGS IN OUR</span>
                <span className="font-light">CARE RIGHT NOW</span>
              </h2>
              <p className="text-[11px] sm:text-sm font-mono text-muted-light dark:text-muted-dark pt-1 max-w-xs sm:max-w-sm leading-relaxed">
                Pick an item to donate directly to a specific dog.
              </p>
            </div>

            {/* Controls */}
            <div className="flex xs:flex-col xs:items-end items-center justify-between xs:justify-start gap-3 shrink-0">
              {/* Count + view all */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                  {dachshunds.length} wieners
                </span>
                <div className="w-6 h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />
                <Link
                  href="/welcomewieners"
                  className="hidden sm:inline font-mono text-[10px] tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  View all →
                </Link>
              </div>

              {/* Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  disabled={atStart}
                  aria-label="Previous dogs"
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </button>
                <button
                  onClick={next}
                  disabled={atEnd}
                  aria-label="Next dogs"
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards — full bleed with fade cues */}
      <div className="relative">
        {/* Right fade */}
        <div
          className="absolute top-0 right-0 w-24 sm:w-40 h-full bg-linear-to-l from-bg-light dark:from-bg-dark to-transparent z-10 pointer-events-none transition-opacity duration-300"
          style={{ opacity: atEnd ? 0 : 1 }}
          aria-hidden="true"
        />
        {/* Left fade */}
        <div
          className="absolute top-0 left-0 w-16 sm:w-24 h-full bg-linear-to-r from-bg-light dark:from-bg-dark to-transparent z-10 pointer-events-none transition-opacity duration-300"
          style={{ opacity: atStart ? 0 : 1 }}
          aria-hidden="true"
        />

        <section
          style={{ marginLeft: leftOffset }}
          className="overflow-x-hidden w-full"
          aria-label="Scrollable dog cards"
        >
          <ul
            ref={scrollRef}
            role="list"
            aria-label="Dogs available for donation"
            className="flex overflow-x-auto snap-x snap-mandatory gap-x-3 scroll-smooth mb-8 sm:mb-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dachshunds.map((dog, i) => (
              <li
                key={dog.id}
                data-card
                role="listitem"
                className="shrink-0 w-[min(85vw,320px)] xs:w-[min(75vw,360px)] sm:w-145"
              >
                <div className="group relative block overflow-hidden h-[min(560px,75vw)] xs:h-[min(600px,78vw)] sm:h-160">
                  {/* Photo */}
                  {dog.images[0] ? (
                    <Picture
                      src={dog.images[0]}
                      alt={`Photo of ${dog.name}`}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      priority={i === 0}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-light dark:bg-surface-dark flex items-center justify-center">
                      <span className="font-mono text-[10px] tracking-widest uppercase text-muted-light dark:text-muted-dark">
                        No photo
                      </span>
                    </div>
                  )}

                  {/* Gradient */}
                  <div
                    className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
                    aria-hidden="true"
                  />

                  {/* Hover wash */}
                  <div
                    className="absolute inset-0 bg-primary-light/0 group-hover:bg-primary-light/10 dark:group-hover:bg-primary-dark/10 transition-colors duration-300"
                    aria-hidden="true"
                  />

                  {/* Index */}
                  <p
                    className="absolute top-3 left-3 sm:top-4 sm:left-4 text-white/40 text-sm font-mono"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </p>

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6">
                    <p className="text-white font-quicksand font-black text-lg sm:text-2xl leading-tight mb-0.5">
                      {dog.name ?? 'Unknown'}
                    </p>
                    {dog.age && <p className="text-white/50 text-[10px] font-mono mb-2 sm:mb-3">{dog.age}</p>}

                    {/* Profile link */}
                    <Link
                      href={`/welcomewieners/${dog.id}`}
                      aria-label={`View full profile for ${dog.name}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between w-full px-3 py-2 border border-white/30 bg-black/20 hover:border-white/60 hover:bg-black/40 text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white group/link"
                    >
                      <span className="text-[10px] font-mono tracking-[0.2em] uppercase">View Profile</span>
                      <ArrowRight
                        className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
            <li className="shrink-0" style={{ width: leftOffset - 12 }} aria-hidden="true" />
          </ul>

          {/* View all */}
        </section>
      </div>

      {/* View all — mobile + desktop below sm */}
      <div className="flex justify-center sm:justify-start px-4 xs:px-5 sm:px-6 lg:px-8">
        <div className="max-w-300 mx-auto w-full">
          <Link
            href="/welcomewieners"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark text-sm font-semibold font-nunito tracking-wide hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-bg-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            View all {dachshunds.length} welcome wieners
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
