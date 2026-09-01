import { bidderDisplay } from 'app/utils/_auction.utils'
import { formatMoney } from 'app/utils/_currency.utils'
import { formatDateTime } from 'app/utils/_date.utils'
import { useInView, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useRef } from 'react'
import { IAuctionBid } from 'types/_auction-bid'

export function BidRow({ bid, rank, delay }: { bid: IAuctionBid; rank: number; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })
  const isTop = rank === 1

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay }}
      className={`flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark last:border-0 ${isTop ? 'bg-primary-light/5 dark:bg-primary-dark/5' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`text-[9px] font-mono font-black w-5 shrink-0 ${isTop ? 'text-primary-light dark:text-primary-dark' : 'text-muted-light dark:text-muted-dark'}`}
        >
          #{rank}
        </span>
        {isTop && (
          <Trophy size={11} className="text-primary-light dark:text-primary-dark shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-mono font-black text-text-light dark:text-text-dark truncate">
            {bidderDisplay(bid)}
          </p>
          <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
            {formatDateTime(bid.createdAt)}
          </p>
        </div>
      </div>
      <span
        className={`text-sm font-mono font-black shrink-0 ml-3 ${isTop ? 'text-primary-light dark:text-primary-dark' : 'text-text-light dark:text-text-dark'}`}
      >
        {formatMoney(bid.bidAmount)}
      </span>
    </motion.div>
  )
}
