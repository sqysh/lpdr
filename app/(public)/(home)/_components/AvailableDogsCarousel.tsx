'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link, { useLinkStatus } from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { card, cardContainer } from 'lib/constants/motion.constants'
import { ArrowLink } from 'components/_primitives/ArrowLink'
import { LinkBody } from 'components/_common/LinkBody'
import Picture from 'components/_common/Picture'

const ARROW_BUTTON =
  'w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

/** useLinkStatus only reports on a navigation, so it has to live inside the card's Link */
function CardPending() {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return (
    <span className="absolute inset-0 z-20 flex items-center justify-center bg-black/50" aria-hidden="true">
      <Loader2 className="w-7 h-7 text-white animate-spin" />
    </span>
  )
}

export const AvailableDogsBlock = ({ data }) => {
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const scrollRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [leftOffset, setLeftOffset] = useState(0)
  const dachshunds = data ?? []

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) setLeftOffset(containerRef.current.getBoundingClientRect().left)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const getCardWidth = useCallback(() => {
    const firstCard = scrollRef.current?.querySelector('li[data-card]') as HTMLElement | null
    return firstCard ? firstCard.getBoundingClientRect().width + 12 : 0
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

  const scrollBy = useCallback(
    (direction: 1 | -1) => {
      const el = scrollRef.current
      if (el) el.scrollTo({ left: el.scrollLeft + direction * getCardWidth(), behavior: 'smooth' })
    },
    [getCardWidth]
  )

  if (!dachshunds.length) {
    return (
      <section
        aria-labelledby="available-heading"
        className="relative w-full mt-20 1200:-mt-60 bg-bg-light dark:bg-bg-dark px-4 xs:px-5 sm:px-6 lg:px-8 py-16"
      >
        <div className="max-w-300 mx-auto">
          <div className="flex items-center gap-3 mb-4" aria-hidden="true">
            <div className="w-8 h-px bg-primary-light dark:bg-primary-dark" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark font-nunito">
              Available for Adoption
            </p>
          </div>
          <h2 id="available-heading" className="font-quicksand font-black text-[2rem] text-text-light dark:text-text-dark mb-6">
            No Dogs Available Right Now
          </h2>
          <p className="font-nunito text-muted-light dark:text-muted-dark mb-8 max-w-md leading-relaxed">
            All of our dachshunds have found homes. Check back soon to meet the next ones.
          </p>
          <Link
            href="/dachshunds"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark text-sm font-nunito font-semibold tracking-wide hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-bg-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <LinkBody icon={<ArrowRight className="w-4 h-4" aria-hidden="true" />} label="Browse all dogs" />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="available-heading" className="relative w-full overflow-hidden mt-20 1200:-mt-60 bg-bg-light dark:bg-bg-dark">
      <div className="px-4 xs:px-5 sm:px-6 lg:px-8">
        <div ref={containerRef} className="relative max-w-300 mx-auto">
          <div className="flex items-end justify-between mb-8 sm:mb-12 gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-3" aria-hidden="true">
                <div className="w-6 sm:w-8 h-px bg-primary-light dark:bg-primary-dark" />
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark font-nunito">
                  Available for Adoption
                </p>
              </div>
              <h2
                id="available-heading"
                className="font-quicksand leading-tight text-text-light dark:text-text-dark"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
              >
                <span className="font-black block">DACHSHUNDS</span>
                <span className="font-light">LOOKING FOR HOMES</span>
              </h2>
            </div>

            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                  {dachshunds.length} dogs
                </span>
                <div className="w-6 h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />
                <Link
                  href="/dachshunds"
                  className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] tracking-eyebrow uppercase text-primary-light dark:text-primary-dark hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  <LinkBody icon={<ArrowRight className="w-3 h-3" aria-hidden="true" />} label="View all" />
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" onClick={() => scrollBy(-1)} disabled={atStart} aria-label="Previous dogs" className={ARROW_BUTTON}>
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => scrollBy(1)} disabled={atEnd} aria-label="Next dogs" className={ARROW_BUTTON}>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Edge fades show there's more to scroll, and drop away at either end */}
        <div
          className="absolute top-0 right-0 w-24 sm:w-32 h-full bg-linear-to-l from-bg-light dark:from-bg-dark to-transparent z-10 pointer-events-none transition-opacity duration-300"
          style={{ opacity: atEnd ? 0 : 1 }}
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-0 w-16 h-full bg-linear-to-r from-bg-light dark:from-bg-dark to-transparent z-10 pointer-events-none transition-opacity duration-300"
          style={{ opacity: atStart ? 0 : 1 }}
          aria-hidden="true"
        />

        {/* Starts in line with the header but runs to the right edge of the screen */}
        <div style={{ marginLeft: leftOffset }} className="overflow-x-hidden w-full">
          <motion.ul
            ref={scrollRef}
            aria-label="Dogs available for adoption"
            variants={cardContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex overflow-x-auto snap-x snap-mandatory gap-x-3 scroll-smooth pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dachshunds.map((dog, i) => {
              const a = dog?.attributes
              const photo = a?.photos?.[0]
              const details = [a?.ageString, a?.colorDetails].filter(Boolean).join(' · ')

              return (
                <motion.li
                  key={dog.id}
                  data-card
                  variants={card}
                  className="shrink-0 snap-start w-[72vw] xs:w-[60vw] sm:w-[42vw] lg:w-[23vw] min-w-56 max-w-72"
                >
                  <Link
                    href={`/dachshunds/${dog.id}`}
                    aria-label={`Meet ${a?.name}${details ? `, ${details}` : ''}`}
                    className="group relative block overflow-hidden aspect-3/5 bg-surface-light dark:bg-surface-dark focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    {photo ? (
                      <Picture
                        priority={i < 3}
                        src={photo}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-widest uppercase text-muted-light dark:text-muted-dark">
                        Photo coming soon
                      </span>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
                    <div
                      className="absolute inset-0 bg-primary-light/0 group-hover:bg-primary-light/30 dark:group-hover:bg-primary-dark/20 transition-colors duration-300"
                      aria-hidden="true"
                    />

                    <p className="absolute top-4 left-4 text-white/70 text-sm font-mono" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </p>

                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <p className="text-white font-quicksand font-bold text-lg sm:text-xl leading-tight">{a?.name}</p>
                      {details && <p className="text-white/75 text-xs font-nunito mt-1">{details}</p>}
                      <span
                        className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-mono tracking-eyebrow uppercase text-white/0 group-hover:text-white transition-colors duration-300"
                        aria-hidden="true"
                      >
                        Meet {a?.name?.split(/[\s(\d]/)[0]}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <CardPending />
                  </Link>
                </motion.li>
              )
            })}
            <li className="shrink-0" style={{ width: Math.max(0, leftOffset - 12) }} aria-hidden="true" />
          </motion.ul>
        </div>
      </div>

      <div className="mt-8 flex justify-center sm:justify-start px-4 xs:px-5 sm:px-6 lg:px-8">
        <div className="max-w-300 mx-auto w-full">
          <ArrowLink href="/dachshunds">View all {dachshunds.length} available dogs</ArrowLink>
        </div>
      </div>
    </section>
  )
}
