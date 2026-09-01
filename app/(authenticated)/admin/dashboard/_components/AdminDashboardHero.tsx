import { formatMoney } from 'lib/utils/currency.utils'
import { motion } from 'framer-motion'
import { HISTORICAL_TOTAL } from 'lib/constants/dashboard.constants'
import { fadeUp } from 'lib/constants/motion.constants'
import { TrendingDown, TrendingUp } from 'lucide-react'

export function AdminDashboardHero({ data }) {
  const monthlyUp = data.monthlyChange >= 0

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={1}
      className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5"
    >
      {/* Total revenue */}
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 sm:p-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2">
          Total revenue · all time
        </p>
        <div className="flex items-end justify-between gap-4">
          <p className="font-quicksand text-4xl sm:text-5xl font-black text-primary-light dark:text-primary-dark leading-none">
            {formatMoney(data.liveRevenue)}
          </p>
          <div className="text-right shrink-0 mb-1">
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark mb-0.5">
              + historical
            </p>
            <p className="font-mono text-sm font-bold text-muted-light dark:text-muted-dark tabular-nums">
              {formatMoney(HISTORICAL_TOTAL)}
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 mt-3">
          {monthlyUp ? (
            <TrendingUp
              className="w-3.5 h-3.5 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          ) : (
            <TrendingDown
              className="w-3.5 h-3.5 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
          )}
          <span
            className={`font-mono text-[10px] tracking-[0.15em] uppercase ${monthlyUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {monthlyUp ? 'Up' : 'Down'} {Math.abs(data.monthlyChange).toFixed(2)}% vs last month
          </span>
        </div>
      </div>

      {/* Quick stat pair: users + auctions, filling the vertical space next to revenue */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 flex flex-col justify-between">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            Pack Members
          </p>
          <div>
            <p className="font-quicksand text-2xl font-black text-text-light dark:text-text-dark leading-none mb-1">
              {data.totalUsers}
            </p>
            <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark">
              +{data.newThisMonth} this month
            </p>
          </div>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 flex flex-col justify-between">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            Active Auctions
          </p>
          <div>
            <p className="font-quicksand text-2xl font-black text-text-light dark:text-text-dark leading-none mb-1">
              {data.activeAuctions}
            </p>
            <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark">
              {formatMoney(data.auctionRevenue)} raised
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
