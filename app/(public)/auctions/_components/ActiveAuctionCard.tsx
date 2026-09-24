'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ChevronRight, Clock, Package, TrendingUp, Users } from 'lucide-react'
import { IAuction } from 'types/auction.types'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { Countdown } from './Countdown'
import { ItemStrip } from './ItemStrip'

export function ActiveAuctionCard({ auction, index, upcoming = false }: { auction: IAuction; index: number; upcoming?: boolean }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduceMotion = useReducedMotion()

  const pct = auction.goal > 0 ? Math.min(100, Math.round((auction.totalAuctionRevenue / auction.goal) * 100)) : 0
  const href = auction.customAuctionLink ? `/auctions/${auction.customAuctionLink}` : `/auctions/${auction.id}`
  const titleId = `auction-${auction.id}-title`

  const borderClass = upcoming ? 'border-primary-light/40 dark:border-primary-dark/30' : 'border-emerald-600/40 dark:border-emerald-500/30'
  const accentClass = upcoming ? 'bg-primary-light dark:bg-primary-dark' : 'bg-emerald-600 dark:bg-emerald-500'

  const stats = upcoming
    ? [
        { icon: Package, label: 'Items', value: String(auction.items.length) },
        { icon: TrendingUp, label: 'Goal', value: formatMoney(auction.goal) }
      ]
    : [
        { icon: TrendingUp, label: 'Raised', value: formatMoney(auction.totalAuctionRevenue) },
        { icon: Package, label: 'Items', value: String(auction.items.length) },
        { icon: Users, label: 'Bidders', value: String(auction.bidders.length) }
      ]

  return (
    <motion.article
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      aria-labelledby={titleId}
      className={`group relative border ${borderClass} bg-bg-light dark:bg-bg-dark overflow-hidden`}
    >
      <div className={`absolute top-0 inset-x-0 h-0.5 ${accentClass} z-10`} aria-hidden="true" />

      {/* Covers the whole card so any tap opens it; the visible CTA below is decorative */}
      <Link
        href={href}
        className={`absolute inset-0 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
          upcoming
            ? 'focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'
            : 'focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-500'
        }`}
      >
        <span className="sr-only">{upcoming ? `Preview the items in ${auction.title}` : `View and bid in ${auction.title}`}</span>
      </Link>

      <div className="flex flex-col p-5 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`block w-6 h-px ${accentClass} shrink-0`} aria-hidden="true" />
            <span className="text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark truncate">
              {upcoming ? 'Upcoming Auction' : 'Active Auction'}
            </span>
          </div>
          {upcoming ? (
            <span className="shrink-0 px-2.5 py-1.5 border border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/10 dark:bg-primary-dark/10 text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark font-black">
              Upcoming
            </span>
          ) : (
            <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono tracking-eyebrow uppercase text-emerald-700 dark:text-emerald-400 font-black">
              <span className="w-1.5 h-1.5 bg-emerald-600 dark:bg-emerald-500 motion-safe:animate-pulse" aria-hidden="true" />
              Live
            </span>
          )}
        </div>

        <h2
          id={titleId}
          className="font-quicksand font-black text-2xl sm:text-3xl text-text-light dark:text-text-dark leading-tight mb-6 wrap-break-word"
        >
          {auction.title}
        </h2>

        <div className="mb-6 pb-6 border-b border-border-light dark:border-border-dark">
          <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-3 flex items-center gap-2">
            <Clock size={11} aria-hidden="true" /> {upcoming ? 'Bidding Opens' : 'Time Remaining'}
          </p>
          {upcoming ? (
            <p className="text-lg sm:text-2xl font-black font-mono text-text-light dark:text-text-dark leading-tight">
              {auction.startDate ? formatDate(auction.startDate, true) : 'Date to be announced'}
            </p>
          ) : (
            <Countdown endDate={auction.endDate} />
          )}
        </div>

        <dl
          className={`grid ${upcoming ? 'grid-cols-2' : 'grid-cols-3'} gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark mb-6`}
        >
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="min-w-0 bg-bg-light dark:bg-bg-dark px-3 py-3">
              <Icon size={12} className="text-muted-light dark:text-muted-dark mb-1.5" aria-hidden="true" />
              <dd className="text-sm sm:text-base font-black font-mono tabular-nums text-text-light dark:text-text-dark leading-none truncate">
                {value}
              </dd>
              <dt className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark mt-1">{label}</dt>
            </div>
          ))}
        </dl>

        {!upcoming && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span id={`${titleId}-goal`} className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
                Goal Progress
              </span>
              <span className="text-[11px] font-mono font-black text-primary-light dark:text-primary-dark">{pct}%</span>
            </div>
            <div
              role="progressbar"
              aria-labelledby={`${titleId}-goal`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              aria-valuetext={`${formatMoney(auction.totalAuctionRevenue)} raised of ${formatMoney(auction.goal)}`}
              className="h-1.5 bg-surface-light dark:bg-surface-dark overflow-hidden"
            >
              <motion.div
                initial={reduceMotion ? false : { width: 0 }}
                animate={inView || reduceMotion ? { width: `${pct}%` } : undefined}
                transition={{ duration: 1, delay: index * 0.1 + 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full bg-primary-light dark:bg-primary-dark"
              />
            </div>
            <div className="flex items-center justify-between mt-1.5" aria-hidden="true">
              <span className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
                {formatMoney(auction.totalAuctionRevenue)} raised
              </span>
              <span className="text-[11px] font-mono text-muted-light dark:text-muted-dark">of {formatMoney(auction.goal)}</span>
            </div>
          </div>
        )}

        {auction.items.length > 0 && (
          <div className="mb-6">
            <ItemStrip items={auction.items} />
          </div>
        )}

        {upcoming ? (
          <div
            aria-hidden="true"
            className="mt-auto flex items-center justify-between px-5 sm:px-6 py-4 border border-border-light dark:border-border-dark group-hover:border-primary-light dark:group-hover:border-primary-dark transition-colors duration-200"
          >
            <span className="text-[11px] font-mono tracking-eyebrow uppercase font-black text-text-light dark:text-text-dark">
              Preview Items
            </span>
            <ChevronRight
              size={16}
              className="text-muted-light dark:text-muted-dark motion-safe:group-hover:translate-x-1 transition-transform duration-150"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="mt-auto flex items-center justify-between px-5 sm:px-6 py-4 bg-emerald-700 group-hover:bg-emerald-800 text-white transition-colors duration-200"
          >
            <span className="text-[11px] font-mono tracking-eyebrow uppercase font-black">Place a Bid</span>
            <ChevronRight size={16} className="motion-safe:group-hover:translate-x-1 transition-transform duration-150" />
          </div>
        )}
      </div>
    </motion.article>
  )
}
