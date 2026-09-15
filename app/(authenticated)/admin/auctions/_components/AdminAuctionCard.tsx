import Link, { useLinkStatus } from 'next/link'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate, getDaysRemaining } from 'lib/utils/date.utils'
import { Gavel, Calendar, Users, ChevronRight, Clock, Package as Package2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getAuctionStatusConfig } from 'lib/utils/auction.utils'
import { getProgressPct } from 'lib/utils/math.utils'
import { IAuction } from 'types/auction.types'

const META = 'text-f9 font-mono text-muted-light dark:text-muted-dark'
const EYEBROW = 'text-f9 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark'

/** Live counts once an auction has rows, the stored totals afterwards. */
function auctionStats(auction: IAuction) {
  return [
    { icon: Package2, label: 'Items', value: auction.items?.length || auction.historicalItemCount || 0 },
    { icon: Users, label: 'Bidders', value: auction.bidders?.length || auction.historicalBidderCount || 0 },
    { icon: Gavel, label: 'Bids', value: auction.bids?.length || auction.historicalBidCount || 0 }
  ]
}

/** useLinkStatus only reports on a navigation, so it has to live inside the Link. */
function OpenIndicator() {
  const { pending } = useLinkStatus()

  return pending ? (
    <Loader2 className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark shrink-0 animate-spin" aria-hidden="true" />
  ) : (
    <ChevronRight
      className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark group-hover:translate-x-0.5 transition-all shrink-0"
      aria-hidden="true"
    />
  )
}

export function AdminAuctionCard({ auction, index }: { auction: IAuction; index: number }) {
  const statusConfig = getAuctionStatusConfig(auction.status)
  const pct = getProgressPct(Number(auction.totalAuctionRevenue), Number(auction.goal))
  const daysLeft = getDaysRemaining(auction.endDate)
  const isActive = auction.status === 'ACTIVE'
  const isEnded = auction.status === 'ENDED'

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
        {isEnded ? (
          // Ended auctions are a reference list, so they stay one compact row: everything on a
          // line, no progress bar, no countdown. Still a link, since the detail page is where
          // winners and fulfilment live.
          <div className="px-5 py-4 flex items-center gap-6">
            <div className="min-w-0 flex-1">
              <span className={`inline-block mb-1 text-f9 font-black tracking-widest uppercase px-2 py-0.5 ${statusConfig.classes}`}>
                {statusConfig.label}
              </span>
              <h3 className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug truncate">
                {auction.title}
              </h3>
              <div className={`flex items-center gap-1.5 mt-1 ${META}`}>
                <Calendar size={9} aria-hidden="true" />
                {formatDate(auction.startDate)} to {formatDate(auction.endDate)}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-6 shrink-0">
              {auctionStats(auction).map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <p className="font-quicksand font-black text-base text-text-light dark:text-text-dark leading-none">{value}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Icon size={9} className="text-muted-light dark:text-muted-dark shrink-0" aria-hidden="true" />
                    <p className={`${META} uppercase tracking-wider`}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 text-right">
              <p className={`${EYEBROW} mb-0.5`}>Revenue</p>
              <p className="font-quicksand font-black text-lg text-text-light dark:text-text-dark tabular-nums leading-none">
                {formatMoney(Number(auction.totalAuctionRevenue))}
              </p>
              <p className={`${META} mt-0.5`}>
                {pct}% of {formatMoney(Number(auction.goal))}
              </p>
            </div>

            <div className="shrink-0">
              <OpenIndicator />
            </div>
          </div>
        ) : (
          <>
            {/* ── Header: status + title ── */}
            <div className="px-5 pt-5 pb-4 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className={`text-f9 font-black tracking-widest uppercase px-2 py-0.5 ${statusConfig.classes}`}>
                  {statusConfig.label}
                </span>
                {isActive && daysLeft > 0 && (
                  <span className={`flex items-center gap-1 ${META}`}>
                    <Clock size={9} aria-hidden="true" />
                    {daysLeft}d left
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-quicksand font-black text-base text-text-light dark:text-text-dark leading-tight line-clamp-2">
                  {auction.title}
                </h3>
                <OpenIndicator />
              </div>
            </div>

            {/* ── Revenue ── */}
            <div className="px-5 py-4 border-b border-border-light dark:border-border-dark">
              <p className={`${EYEBROW} mb-1`}>Revenue</p>
              <p className="font-quicksand font-black text-2xl text-text-light dark:text-text-dark tabular-nums leading-none mb-3">
                {formatMoney(Number(auction.totalAuctionRevenue))}
              </p>
              <div className="h-0.5 bg-border-light dark:bg-border-dark overflow-hidden mb-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: index * 0.06 + 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-primary-light dark:bg-primary-dark'}`}
                />
              </div>
              <p className={META}>
                {pct}% of {formatMoney(Number(auction.goal))} goal
              </p>
            </div>

            {/* ── Supporting stats ── */}
            <div className="flex items-center divide-x divide-border-light dark:divide-border-dark border-b border-border-light dark:border-border-dark">
              {auctionStats(auction).map(({ icon: Icon, label, value }) => (
                <div key={label} className="px-6 py-3 flex items-center gap-3">
                  <p className="font-quicksand font-black text-xl text-text-light dark:text-text-dark leading-none">{value}</p>
                  <div className="flex items-center gap-1">
                    <Icon size={10} className="text-muted-light dark:text-muted-dark shrink-0" aria-hidden="true" />
                    <p className={`${META} uppercase tracking-wider`}>{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Dates footer ── */}
            <div className={`px-5 py-3 flex items-center gap-1.5 ${META}`}>
              <Calendar size={10} aria-hidden="true" />
              {formatDate(auction.startDate)} to {formatDate(auction.endDate)}
            </div>
          </>
        )}
      </Link>
    </motion.div>
  )
}
