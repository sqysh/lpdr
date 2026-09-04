import { getProgressPct } from 'lib/utils/math.utils'
import { useRef } from 'react'
import Link from 'next/link'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { Clock, TrendingUp, Users, Package, ArrowLeft } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { CountUnit } from 'components/_primitives'
import { IAuction } from 'types/auction.types'
import { getDisplayRevenue } from 'lib/utils/auction.utils'
import { SlotValue } from './SlotValue'

type Props = {
  auction: IAuction
  isActive: boolean
  isEnded: boolean
  isDraft: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
  trigger: number
}

export function HeaderBand({ auction, isActive, isEnded, isDraft, days, hours, minutes, seconds, done, trigger }: Props) {
  const headerRef = useRef(null)

  const headerInView = useInView(headerRef, { once: true })
  const displayRevenue = getDisplayRevenue(auction)
  const pct = getProgressPct(displayRevenue, auction.goal)

  return (
    <section
      ref={headerRef}
      aria-labelledby="auction-heading"
      className="border-b border-border-light dark:border-border-dark relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 py-10 sm:py-14">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={headerInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.35 }}
          className="mb-6"
        >
          <Link
            href="/auctions"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:underline"
            aria-label="Back to all auctions"
          >
            <ArrowLeft size={12} aria-hidden="true" /> All Auctions
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* ── Left: title + status ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={headerInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex items-center gap-3 mb-4"
            >
              <span
                className={`block w-6 h-px shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-primary-light dark:bg-primary-dark'}`}
                aria-hidden="true"
              />
              <div className="flex items-center gap-2">
                {isActive && <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />}
                <span
                  className={`text-[10px] font-mono tracking-[0.2em] uppercase ${isActive ? 'text-emerald-500' : 'text-primary-light dark:text-primary-dark'}`}
                >
                  {isActive ? 'Live Now' : isEnded ? 'Auction Ended' : 'Upcoming'}
                </span>
              </div>
            </motion.div>

            <motion.h1
              id="auction-heading"
              initial={{ opacity: 0, y: 18 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-quicksand font-black text-3xl xs:text-4xl sm:text-5xl text-text-light dark:text-text-dark leading-[1.04] mb-5"
            >
              {auction.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="text-[10px] font-mono text-muted-light dark:text-muted-dark"
            >
              {isDraft
                ? `Opens ${formatDate(auction.startDate)}`
                : `${formatDate(auction.startDate)} — ${formatDate(auction.endDate)}`}
            </motion.p>
          </div>

          {/* ── Right: countdown + stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="space-y-4"
          >
            {/* Countdown */}
            {(isActive || isDraft) && !done && (
              <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={11} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                    {isDraft ? 'Opens In' : 'Closing In'}
                  </span>
                </div>
                <div
                  className="flex items-end gap-4 xs:gap-6"
                  aria-label={`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds ${isDraft ? 'until bidding opens' : 'remaining'}`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {days > 0 && <CountUnit value={days} label="days" size="sm" />}
                  <CountUnit value={hours} label="hrs" size="sm" />
                  <CountUnit value={minutes} label="min" size="sm" />
                  <CountUnit value={seconds} label="sec" size="sm" />
                </div>
              </div>
            )}

            {/* Stats */}
            {isDraft ? (
              <div className="grid grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
                {[
                  { icon: Package, label: 'Items', value: String(auction.items.length) },
                  { icon: TrendingUp, label: 'Goal', value: formatMoney(auction.goal) }
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-bg-light dark:bg-bg-dark px-3 xs:px-4 py-4">
                    <Icon size={11} className="text-muted-light dark:text-muted-dark mb-2" aria-hidden="true" />
                    <p className="font-mono font-black text-sm xs:text-base text-text-light dark:text-text-dark leading-none">
                      {value}
                    </p>
                    <p className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
                {[
                  {
                    icon: TrendingUp,
                    label: 'Raised',
                    value: formatMoney(displayRevenue),
                    slot: true
                  },
                  { icon: Package, label: 'Items', value: String(auction.items.length), slot: false },
                  {
                    icon: Users,
                    label: 'Bidders',
                    value: String(auction.bidders.length),
                    slot: false
                  }
                ].map(({ icon: Icon, label, value, slot }) => (
                  <div key={label} className="bg-bg-light dark:bg-bg-dark px-3 xs:px-4 py-4">
                    <Icon size={11} className="text-muted-light dark:text-muted-dark mb-2" aria-hidden="true" />
                    {slot ? (
                      <SlotValue value={value} trigger={trigger} />
                    ) : (
                      <p className="font-mono font-black text-sm xs:text-base text-text-light dark:text-text-dark leading-none">
                        {value}
                      </p>
                    )}
                    <p className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Goal progress */}
            {!isDraft && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">Goal Progress</span>
                  <span className="text-[10px] font-mono font-black text-primary-light dark:text-primary-dark">{pct}%</span>
                </div>
                <div
                  className="h-1.5 bg-surface-light dark:bg-surface-dark overflow-hidden"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${pct}% of goal reached`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={headerInView ? { width: `${pct}%` } : {}}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-primary-light dark:bg-primary-dark'}`}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                    {formatMoney(displayRevenue)} raised
                  </span>
                  <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                    of {formatMoney(auction.goal)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
