import { formatDateTime, getDaysRemaining } from 'lib/utils/date.utils'
import { IAuctionDetail } from 'types/auction.types'
import { formatMoney } from 'lib/utils/currency.utils'
import { Clock, DollarSign, Gavel, Package, UserPlus, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import Picture from 'components/_common/Picture'
import { getDisplayRevenue } from 'lib/utils/auction.utils'
import { StatCard } from '../[itemId]/view/_components/StatCard'
import { AuctionSignups } from 'lib/actions/admin/auction/getAuctionSignups'

const EYEBROW = 'text-f9 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark'
const META = 'text-f10 font-mono text-muted-light dark:text-muted-dark'

export function OverviewTab({ auction, signups }: { auction: IAuctionDetail; signups: AuctionSignups }) {
  const isEnded = auction.status === 'ENDED'
  const displayRevenue = getDisplayRevenue(auction)
  const pct = auction.goal > 0 ? Math.min(100, Math.round((displayRevenue / auction.goal) * 100)) : 0
  const daysLeft = getDaysRemaining(auction.endDate)

  // Filter before deciding whether the panel is empty: items with no bids yet are the normal
  // state for the first stretch of an auction, and they were rendering as a blank box.
  const topItems = [...auction.items]
    .filter((i) => i.sellingFormat === 'AUCTION' && i.totalBids > 0)
    .sort((a, b) => b.totalBids - a.totalBids)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
        <StatCard
          label={isEnded ? 'Revenue' : 'Secured'}
          value={formatMoney(displayRevenue)}
          icon={DollarSign}
          iconColor="text-primary-light dark:text-primary-dark"
          delay={0}
        />
        <StatCard label="Items" value={String(auction.items.length)} icon={Package} iconColor="text-violet-500" delay={0.06} />
        <StatCard label="Bidders" value={String(auction.bidders.length)} icon={Users} iconColor="text-pink-500" delay={0.12} />
        {/* The headline is the attributable number. Every account created during the auction
            window is in signups.newAccounts, including people who came for something else. */}
        <StatCard
          label="New Bidders"
          value={String(signups.newBidders)}
          sub={`${signups.newAccounts} new account${signups.newAccounts !== 1 ? 's' : ''} in total`}
          icon={UserPlus}
          iconColor="text-indigo-500"
          delay={0.14}
        />
        <StatCard label="Total Bids" value={String(auction.bids.length)} icon={Gavel} iconColor="text-amber-500" delay={0.18} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goal progress */}
        <section
          aria-labelledby="goal-heading"
          className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
        >
          <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
            <h2 id="goal-heading" className={EYEBROW}>
              Goal Progress
            </h2>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-black font-quicksand tabular-nums text-text-light dark:text-text-dark">
                  {formatMoney(displayRevenue)}
                </p>
                <p className={`${META} mt-0.5`}>
                  {isEnded ? 'total revenue · ' : 'secured · '}
                  goal {formatMoney(auction.goal)}
                </p>
              </div>
              <p className="text-xl font-black font-mono tabular-nums text-primary-light dark:text-primary-dark">{pct}%</p>
            </div>

            <div
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Auction goal progress"
              className="h-1.5 bg-bg-light dark:bg-bg-dark overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-primary-light dark:bg-primary-dark'}`}
              />
            </div>

            <dl className="grid grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
              <div className="bg-bg-light dark:bg-bg-dark px-3 py-2">
                <dt className="text-f9 font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">Start</dt>
                <dd className="text-[11px] font-mono text-text-light dark:text-text-dark mt-0.5">{formatDateTime(auction.startDate)}</dd>
              </div>
              <div className="bg-bg-light dark:bg-bg-dark px-3 py-2">
                <dt className="text-f9 font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">End</dt>
                <dd className="text-[11px] font-mono text-text-light dark:text-text-dark mt-0.5">{formatDateTime(auction.endDate)}</dd>
              </div>
            </dl>

            {auction.status === 'ACTIVE' && daysLeft > 0 && (
              <p className="flex items-center gap-1.5 text-f10 font-mono text-amber-500">
                <Clock size={11} aria-hidden="true" />
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        </section>

        {/* Top items */}
        <section
          aria-labelledby="top-items-heading"
          className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
        >
          <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
            <h2 id="top-items-heading" className={EYEBROW}>
              Top Items by Bids
            </h2>
          </div>
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {topItems.length > 0 ? (
              topItems.map((item, i) => (
                <div
                  key={item.id}
                  className="px-4 py-2.5 flex items-center gap-3 hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors"
                >
                  <span className={`${META} tabular-nums w-4 shrink-0`}>{i + 1}</span>
                  {item.photos[0] ? (
                    <Picture
                      priority={false}
                      src={item.photos[0].url}
                      alt=""
                      className="w-7 h-7 object-cover border border-border-light dark:border-border-dark shrink-0"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      <Package size={11} className="text-muted-light dark:text-muted-dark" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-light dark:text-text-dark truncate">{item.name}</p>
                  </div>
                  <p className={`${META} tabular-nums shrink-0`}>{item.totalBids} bids</p>
                  <p className="text-xs font-black font-mono tabular-nums text-text-light dark:text-text-dark shrink-0 w-16 text-right">
                    {formatMoney(item.currentBid)}
                  </p>
                </div>
              ))
            ) : (
              <p className={`px-4 py-10 text-center ${EYEBROW}`}>{auction.items.length === 0 ? 'No items yet' : 'No bids yet'}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
