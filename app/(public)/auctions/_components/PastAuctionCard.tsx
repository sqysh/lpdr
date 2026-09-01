import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { IAuction } from 'types/_auction'
import { motion } from 'framer-motion'
import { Gavel, Package, TrendingUp, Users } from 'lucide-react'
import { formatMoney } from 'app/utils/_currency.utils'
import Picture from 'app/components/_common/Picture'

export function PastAuctionCard({ auction, index }: { auction: IAuction; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const pct = auction.goal > 0 ? Math.min(100, Math.round((auction.totalAuctionRevenue / auction.goal) * 100)) : 0

  const featuredPhoto = auction.items.flatMap((i) => i.photos).find((p) => p.isPrimary) ?? auction.items[0]?.photos?.[0]

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark overflow-hidden"
      aria-label={auction.title}
    >
      {/* Photo */}
      <div className="relative aspect-3/2 overflow-hidden bg-surface-light dark:bg-surface-dark">
        {featuredPhoto ? (
          <Picture
            priority={false}
            src={featuredPhoto.url}
            alt={`Featured item from ${auction.title}`}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gavel size={32} className="text-border-light dark:text-border-dark" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm px-2.5 py-1 border border-border-light dark:border-border-dark">
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark font-black">
            Ended
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-quicksand font-black text-base text-text-light dark:text-text-dark leading-snug mb-3">
          {auction.title}
        </h3>

        {/* Mini stats */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={11} className="text-primary-light dark:text-primary-dark" aria-hidden="true" />
            <span className="text-xs font-mono font-black text-text-light dark:text-text-dark">
              {formatMoney(auction.totalAuctionRevenue)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package size={11} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
            <span className="text-xs font-mono text-muted-light dark:text-muted-dark">
              {auction.items.length} items
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
            <span className="text-xs font-mono text-muted-light dark:text-muted-dark">
              {auction.bidders.length} bidders
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-0.5 bg-surface-light dark:bg-surface-dark overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: `${pct}%` } : {}}
            transition={{ duration: 0.8, delay: (index % 3) * 0.07 + 0.3 }}
            className={`h-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-muted-light dark:bg-muted-dark'}`}
          />
        </div>
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
          {pct}% of {formatMoney(auction.goal)} goal
        </p>
      </div>
    </motion.article>
  )
}
