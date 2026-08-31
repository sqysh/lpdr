import Link from 'next/link'
import { formatMoney } from 'app/utils/_currency.utils'
import { formatDate, getDaysRemaining } from 'app/utils/_date.utils'
import { Gavel, Calendar, Users, ChevronRight, Clock, Package as Package2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getAuctionStatusConfig } from 'app/utils/_auction.utils'
import { getProgressPct } from 'app/utils/_math.utils'
import { IAuction } from 'types/_auction'

export function AdminAuctionCard({ auction, index }: { auction: IAuction; index: number }) {
  const statusConfig = getAuctionStatusConfig(auction.status)
  const pct = getProgressPct(Number(auction.totalAuctionRevenue), Number(auction.goal))
  const daysLeft = getDaysRemaining(auction.endDate)
  const isActive = auction.status === 'ACTIVE'
  const isEnded = auction.status === 'ENDED'

  if (isEnded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-5 py-4 flex items-center gap-6"
      >
        {/* Status + title */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 ${statusConfig.classes}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <h2 className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug truncate">
            {auction.title}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-[9px] font-mono text-muted-light dark:text-muted-dark">
            <Calendar size={9} aria-hidden="true" />
            {formatDate(auction.startDate)} — {formatDate(auction.endDate)}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 shrink-0">
          {[
            {
              icon: Package2,
              label: 'Items',
              value: auction.items?.length || auction.historicalItemCount || 0
            },
            {
              icon: Users,
              label: 'Bidders',
              value: auction.bidders?.length || auction.historicalBidderCount || 0
            },
            {
              icon: Gavel,
              label: 'Bids',
              value: auction.bids?.length || auction.historicalBidCount || 0
            }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <p className="font-quicksand font-black text-base text-text-light dark:text-text-dark leading-none">
                {value}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Icon
                  size={9}
                  className="text-muted-light dark:text-muted-dark shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark uppercase tracking-wider">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div className="shrink-0 text-right">
          <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-0.5">
            Revenue
          </p>
          <p className="font-quicksand font-black text-lg text-text-light dark:text-text-dark tabular-nums leading-none">
            {formatMoney(Number(auction.totalAuctionRevenue))}
          </p>
          <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
            {pct}% of {formatMoney(Number(auction.goal))}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        href={`/admin/auctions/${auction.id}`}
        className="group block border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary-light/50 dark:hover:border-primary-dark/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        aria-label={`Open ${auction.title} auction`}
      >
        {/* ── Header: status + title ── */}
        <div className="px-5 pt-5 pb-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span
              className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 ${statusConfig.classes}`}
            >
              {statusConfig.label}
            </span>
            {isActive && daysLeft > 0 && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-muted-light dark:text-muted-dark">
                <Clock size={9} aria-hidden="true" />
                {daysLeft}d left
              </span>
            )}
          </div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-quicksand font-black text-base text-text-light dark:text-text-dark leading-snug">
              {auction.title}
            </h2>
            <ChevronRight
              size={15}
              className="text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:translate-x-0.5 transition-all duration-150 shrink-0 mt-0.5"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ── Revenue ── */}
        <div className="px-5 py-4 border-b border-border-light dark:border-border-dark">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1">
            Revenue
          </p>
          <p className="font-quicksand font-black text-2xl text-text-light dark:text-text-dark tabular-nums leading-none mb-3">
            {formatMoney(Number(auction.totalAuctionRevenue))}
          </p>
          <div className="h-0.5 bg-border-light dark:bg-border-dark overflow-hidden mb-1.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{
                duration: 0.7,
                delay: index * 0.06 + 0.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-primary-light dark:bg-primary-dark'}`}
            />
          </div>
          <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark">
            {pct}% of {formatMoney(Number(auction.goal))} goal
          </p>
        </div>

        {/* ── Supporting stats ── */}
        <div className="flex items-center divide-x divide-border-light dark:divide-border-dark border-b border-border-light dark:border-border-dark">
          {[
            {
              icon: Package2,
              label: 'Items',
              value: auction.items?.length || auction.historicalItemCount || 0
            },
            {
              icon: Users,
              label: 'Bidders',
              value: auction.bidders?.length || auction.historicalBidderCount || 0
            },
            {
              icon: Gavel,
              label: 'Bids',
              value: auction.bids?.length || auction.historicalBidCount || 0
            }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="px-6 py-3 flex items-center gap-3">
              <p className="font-quicksand font-black text-xl text-text-light dark:text-text-dark leading-none">
                {value}
              </p>
              <div className="flex items-center gap-1">
                <Icon
                  size={10}
                  className="text-muted-light dark:text-muted-dark shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark uppercase tracking-wider">
                  {label}
                </p>
              </div>
            </div>
          ))}
          <div className="ml-auto px-6 py-3 flex items-center gap-6">
            <div>
              <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-0.5">
                Revenue
              </p>
              <p className="font-quicksand font-black text-xl text-text-light dark:text-text-dark tabular-nums leading-none">
                {formatMoney(Number(auction.totalAuctionRevenue))}
              </p>
            </div>
            <div className="w-24">
              <div className="h-0.5 bg-border-light dark:bg-border-dark overflow-hidden mb-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.06 + 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-primary-light dark:bg-primary-dark'}`}
                />
              </div>
              <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark">
                {pct}% of goal
              </p>
            </div>
          </div>
        </div>

        {/* ── Dates footer ── */}
        <div className="px-5 py-3 flex items-center gap-1.5 text-[9px] font-mono text-muted-light dark:text-muted-dark">
          <Calendar size={10} aria-hidden="true" />
          {formatDate(auction.startDate)} — {formatDate(auction.endDate)}
        </div>
      </Link>
    </motion.div>
  )
}
