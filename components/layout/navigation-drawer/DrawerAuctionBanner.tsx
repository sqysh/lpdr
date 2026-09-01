import { motion } from 'framer-motion'
import { Gavel } from 'lucide-react'
import Link from 'next/link'

const ACTIVE_GRADIENT = 'linear-gradient(90deg, #7c3aed, #db2777, #ea580c, #db2777, #7c3aed)'
const DRAFT_GRADIENT = 'linear-gradient(90deg, #0e7490, #0891b2, #06b6d4, #0891b2, #0e7490)'

export function DrawerAuctionBanner({ auction, onClose }: { auction: any; onClose: () => void }) {
  const isActive = auction?.status === 'ACTIVE'
  const isDraft = auction?.status === 'DRAFT'

  if (!auction?.status || (!isActive && !isDraft)) return null

  return (
    <div
      style={{
        background: isActive ? ACTIVE_GRADIENT : DRAFT_GRADIENT,
        backgroundSize: '200% 100%',
        animation: 'stripScroll 4s linear infinite'
      }}
    >
      <Link
        href={`/auctions/${auction?.customAuctionLink}`}
        onClick={onClose}
        className="relative overflow-hidden flex items-start gap-3 p-4 backdrop-blur-sm bg-white/10 border-y border-white/20 transition-colors hover:bg-white/20"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Gavel className="w-4 h-4 text-white shrink-0 mt-0.5" aria-hidden="true" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wide text-white leading-snug">
            {isActive ? `${auction?.title} — Live Now` : `${auction?.title} — Coming Soon`}
          </p>
          <p className="font-lato text-f10 text-white/70 mt-0.5">
            {isActive ? 'Bid now on amazing items' : 'Get ready to bid'}
          </p>
        </div>
        {isActive && (
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white text-sm shrink-0"
            aria-hidden="true"
          >
            →
          </motion.span>
        )}
      </Link>
    </div>
  )
}
