import { useSounds } from 'lib/hooks/useSounds.hook'
import Picture from 'components/_common/Picture'
import { placeBid } from 'lib/actions/user/auction/placeBid'
import { formatMoney } from 'lib/utils/currency.utils'
import { useInView, motion } from 'framer-motion'
import { Check, ChevronRight, Gavel, Loader2, Tag, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { IAuctionItemLive } from 'types/auction-item.types'
import { AuctionStatus } from '@prisma/client'

type Props = {
  item: IAuctionItemLive
  auctionStatus: AuctionStatus
  index: number
  customAuctionLink: string
  onBidSuccess?: () => void
}

export function AuctionItemCard({ item, auctionStatus, index, customAuctionLink, onBidSuccess }: Props) {
  const router = useRouter()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [quickBidLoading, setQuickBidLoading] = useState(false)
  const [quickBidError, setQuickBidError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const { play } = useSounds()

  const quickBidAmount = Number(item.currentBid ?? item.startingPrice ?? 0) + 10

  const photo = item.photos.find((p) => p.isPrimary) ?? item.photos[0]
  const isEnded = auctionStatus === 'ENDED'
  const isUpcoming = auctionStatus === 'DRAFT'
  const isSold = item.status === 'SOLD'

  const displayPrice = item.sellingFormat === 'FIXED' ? item.buyNowPrice : (item.currentBid ?? item.startingPrice)
  const bidCount = item._count?.bids ?? 0

  const ribbonLabel = isSold ? 'Sold' : isEnded ? 'Ended' : isUpcoming ? 'Upcoming' : null

  const handleQuickBid = async () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    setConfirming(false)
    setQuickBidLoading(true)
    setQuickBidError(null)

    const result = await placeBid(item.id, quickBidAmount)

    setQuickBidLoading(false)

    if (result.success) {
      play('se2')
      onBidSuccess?.()
      window.dispatchEvent(new Event('confetti-burst'))
      router.refresh()
    } else {
      setQuickBidError(
        result.error === 'LOCK_NOT_ACQUIRED'
          ? `Bid updated to $${result.data?.newMinimumBid ?? quickBidAmount}. Try again.`
          : (result.error ?? 'Something went wrong.')
      )
    }
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      aria-label={item.name}
      className="group relative bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark overflow-hidden flex flex-col h-full"
    >
      {/* Badge strip */}
      <div className="absolute top-3 left-3 z-10 flex items-stretch bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm border border-border-light dark:border-border-dark">
        <div className="px-2 py-1 flex items-center gap-1.5">
          {item.sellingFormat === 'FIXED' ? (
            <Tag size={9} aria-hidden="true" className="text-muted-light dark:text-muted-dark" />
          ) : (
            <Gavel size={9} aria-hidden="true" className="text-primary-light dark:text-primary-dark" />
          )}
          <span
            className={`text-[9px] font-mono tracking-[0.2em] uppercase font-black ${
              item.sellingFormat === 'FIXED'
                ? 'text-muted-light dark:text-muted-dark'
                : 'text-primary-light dark:text-primary-dark'
            }`}
          >
            {item.sellingFormat === 'FIXED' ? 'Buy Now' : 'Auction'}
          </span>
        </div>

        {ribbonLabel && (
          <div className="px-2 py-1 flex items-center border-l border-border-light dark:border-border-dark">
            <span
              className={`text-[9px] font-mono tracking-[0.2em] uppercase font-black ${
                isSold
                  ? 'text-emerald-500'
                  : isUpcoming
                    ? 'text-primary-light dark:text-primary-dark'
                    : 'text-muted-light dark:text-muted-dark'
              }`}
            >
              {ribbonLabel}
            </span>
          </div>
        )}
      </div>

      {/* Photo */}
      <div className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark">
        {photo ? (
          <Picture
            priority={true}
            src={photo.url}
            alt={item.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${isSold || isEnded ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
              aria-hidden="true"
            />
            <span className="font-quicksand font-black text-2xl text-primary-light/20 dark:text-primary-dark/20 select-none">
              LP
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1">
          <h3 className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug mb-2 line-clamp-2">
            {item.name}
          </h3>
          <p className="text-[11px] font-nunito text-muted-light dark:text-muted-dark leading-relaxed mb-3 line-clamp-2">
            {item.description}
          </p>
        </div>

        <div className="space-y-2">
          {/* Bid count, hidden before the auction opens */}
          {item.sellingFormat !== 'FIXED' && !isUpcoming && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">Bids</span>
              <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">{bidCount}</span>
            </div>
          )}

          {/* Price */}
          {!isUpcoming && displayPrice != null && (
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
                {item.sellingFormat === 'FIXED' ? 'Price' : isUpcoming || !item.currentBid ? 'Starting' : 'Current Bid'}
              </span>
              <span className="font-mono font-black text-sm text-text-light dark:text-text-dark">
                {formatMoney(displayPrice)}
              </span>
            </div>
          )}

          {/* Upcoming: preview only, no bidding path */}
          {isUpcoming && (
            <p className="mt-2 px-3.5 py-2.5 border border-border-light dark:border-border-dark text-[9px] font-mono tracking-[0.2em] uppercase font-black text-muted-light dark:text-muted-dark text-center">
              {item.sellingFormat === 'FIXED' ? 'Available Soon' : 'Bidding Opens Soon'}
            </p>
          )}

          {auctionStatus === 'ACTIVE' && !isSold && (
            <div className="mt-2 space-y-1.5">
              {/* Quick Bid — on top, casino energy */}
              {item.sellingFormat === 'AUCTION' && (
                <>
                  <button
                    type="button"
                    onClick={handleQuickBid}
                    disabled={quickBidLoading}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 text-[9px] font-mono tracking-[0.2em] uppercase font-black disabled:opacity-50 disabled:cursor-not-allowed ${
                      confirming ? 'bg-amber-400 text-amber-950' : 'bg-amber-500 hover:bg-amber-400 text-white'
                    }`}
                  >
                    <span>
                      {quickBidLoading
                        ? 'Bidding...'
                        : confirming
                          ? `Confirm ${formatMoney(quickBidAmount)}?`
                          : `⚡ Quick Bid ${formatMoney(quickBidAmount)}`}
                    </span>
                    {quickBidLoading ? (
                      <Loader2 size={10} className="animate-spin" aria-hidden="true" />
                    ) : confirming ? (
                      <Check size={10} aria-hidden="true" />
                    ) : (
                      <Zap size={10} aria-hidden="true" />
                    )}
                  </button>

                  {quickBidError && <p className="text-[9px] font-mono text-red-500 dark:text-red-400">{quickBidError}</p>}
                </>
              )}

              {/* Main CTA — shimmer */}
              <Link
                href={`/auctions/${customAuctionLink}/${item.id}`}
                className={`btn-shimmer relative overflow-hidden group/btn flex items-center justify-between px-3.5 py-2.5 text-white transition-colors focus:outline-none focus-visible:ring-2 ${
                  item.sellingFormat === 'FIXED'
                    ? 'bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500'
                    : 'bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'
                }`}
                aria-label={`${item.sellingFormat === 'FIXED' ? 'Buy' : 'Bid on'} ${item.name}`}
              >
                <span className="text-[9px] font-mono tracking-[0.2em] uppercase font-black relative z-10">
                  {item.sellingFormat === 'FIXED' ? 'Buy Now' : 'Place Bid'}
                </span>
                <ChevronRight
                  size={12}
                  className="group-hover/btn:translate-x-0.5 transition-transform relative z-10"
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}
