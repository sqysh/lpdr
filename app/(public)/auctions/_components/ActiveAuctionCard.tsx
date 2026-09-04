import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { IAuction } from 'types/auction.types'
import { motion } from 'framer-motion'
import { ChevronRight, Clock, Package, TrendingUp, Users } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import Link from 'next/link'
import { Countdown } from './Countdown'
import { ItemStrip } from './ItemStrip'
import { formatDate } from 'lib/utils/date.utils'

export function ActiveAuctionCard({
  auction,
  index,
  upcoming = false
}: {
  auction: IAuction
  index: number
  upcoming?: boolean
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const pct = auction.goal > 0 ? Math.min(100, Math.round((auction.totalAuctionRevenue / auction.goal) * 100)) : 0
  const href = auction.customAuctionLink ? `/auctions/${auction.customAuctionLink}` : `/auctions/${auction.id}`

  const borderClass = upcoming
    ? 'border-primary-light/40 dark:border-primary-dark/30'
    : 'border-emerald-500/40 dark:border-emerald-500/30'
  const accentClass = upcoming ? 'bg-primary-light dark:bg-primary-dark' : 'bg-emerald-500'

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      aria-label={auction.title}
      className={`group relative border ${borderClass} bg-bg-light dark:bg-bg-dark overflow-hidden`}
    >
      {/* Accent line */}
      <div className={`absolute top-0 inset-x-0 h-0.5 ${accentClass} z-10`} aria-hidden="true" />

      {/* Card-wide link */}
      <Link
        href={href}
        className={`absolute inset-0 z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
          upcoming ? 'focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark' : 'focus-visible:ring-emerald-500'
        }`}
        aria-label={upcoming ? `Preview ${auction.title} auction` : `View ${auction.title} auction`}
      >
        <span className="sr-only">{upcoming ? `Preview ${auction.title} auction` : `View ${auction.title} auction`}</span>
      </Link>

      <div className="flex flex-col p-6 sm:p-8">
        {/* Label + status badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`block w-6 h-px ${accentClass} shrink-0`} aria-hidden="true" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              {upcoming ? 'Upcoming Auction' : 'Active Auction'}
            </span>
          </div>
          {upcoming ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/10 dark:bg-primary-dark/10">
              <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark font-black">
                Upcoming
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-emerald-500/30 bg-emerald-500/10">
              <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-emerald-500 font-black">Live</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="font-quicksand font-black text-2xl sm:text-3xl text-text-light dark:text-text-dark leading-tight mb-6">
          {auction.title}
        </h2>

        {/* Timing */}
        <div className="mb-6 pb-6 border-b border-border-light dark:border-border-dark">
          <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-3 flex items-center gap-2">
            <Clock size={10} aria-hidden="true" /> {upcoming ? 'Bidding Opens' : 'Time Remaining'}
          </p>
          {upcoming ? (
            <p className="text-xl sm:text-2xl font-black font-mono text-text-light dark:text-text-dark leading-none">
              {auction.startDate ? formatDate(auction.startDate) : 'Date To Be Announced'}
            </p>
          ) : (
            <Countdown endDate={auction.endDate} />
          )}
        </div>

        {/* Stats */}
        {upcoming ? (
          <div className="grid grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark mb-6">
            {[
              { icon: Package, label: 'Items', value: String(auction.items.length) },
              { icon: TrendingUp, label: 'Goal', value: formatMoney(auction.goal) }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-bg-light dark:bg-bg-dark px-3 py-3">
                <Icon size={12} className="text-muted-light dark:text-muted-dark mb-1.5" aria-hidden="true" />
                <p className="text-base font-black font-mono text-text-light dark:text-text-dark leading-none">{value}</p>
                <p className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark mb-6">
            {[
              { icon: TrendingUp, label: 'Raised', value: formatMoney(auction.totalAuctionRevenue) },
              { icon: Package, label: 'Items', value: String(auction.items.length) },
              { icon: Users, label: 'Bidders', value: String(auction.bidders.length) }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-bg-light dark:bg-bg-dark px-3 py-3">
                <Icon size={12} className="text-muted-light dark:text-muted-dark mb-1.5" aria-hidden="true" />
                <p className="text-base font-black font-mono text-text-light dark:text-text-dark leading-none">{value}</p>
                <p className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Goal progress, live only */}
        {!upcoming && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">Goal Progress</span>
              <span className="text-[10px] font-mono font-black text-primary-light dark:text-primary-dark">{pct}%</span>
            </div>
            <div className="h-1.5 bg-surface-light dark:bg-surface-dark overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${pct}%` } : {}}
                transition={{ duration: 1, delay: index * 0.1 + 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="h-full bg-primary-light dark:bg-primary-dark"
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                {formatMoney(auction.totalAuctionRevenue)} raised
              </span>
              <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">of {formatMoney(auction.goal)}</span>
            </div>
          </div>
        )}

        {/* Item strip */}
        {auction.items.length > 0 && (
          <div className="mb-6">
            <ItemStrip items={auction.items} />
          </div>
        )}

        {/* CTA */}
        {upcoming ? (
          <div
            aria-hidden="true"
            className="mt-auto flex items-center justify-between px-6 py-4 border border-border-light dark:border-border-dark group-hover:border-primary-light dark:group-hover:border-primary-dark transition-colors duration-200"
          >
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black text-muted-light dark:text-muted-dark">
              Preview Items
            </span>
            <ChevronRight
              size={16}
              className="text-muted-light dark:text-muted-dark group-hover:translate-x-1 transition-transform duration-150"
              aria-hidden="true"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="mt-auto flex items-center justify-between px-6 py-4 bg-emerald-500 group-hover:bg-emerald-600 text-white transition-colors duration-200"
          >
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black">Place a Bid</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-150" aria-hidden="true" />
          </div>
        )}
      </div>
    </motion.article>
  )
}
