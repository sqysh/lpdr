import { bidderDisplay } from 'lib/utils/auction.utils'
import { formatMoney } from 'lib/utils/currency.utils'
import { motion } from 'framer-motion'
import { ChevronRight, Gavel, Package, Zap } from 'lucide-react'
import Link from 'next/link'
import { useAuctionUiStore } from 'stores/auction-ui.store'

export function PriceBlock({
  headerInView,
  item,
  isActive,
  isSold,
  isFixed,
  topBid,
  isAuthed,
  customAuctionLink,
  isEnded
}) {
  const openBidModal = useAuctionUiStore((s) => s.openBidModal)
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)

  const displayBid = item?.currentBid ?? item?.startingPrice
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={headerInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.14 }}
      className="border border-border-light dark:border-border-dark"
    >
      {/* Accent line */}
      <div
        className={`h-0.5 ${isActive && !isSold ? 'bg-primary-light dark:bg-primary-dark' : 'bg-border-light dark:bg-border-dark'}`}
        aria-hidden="true"
      />

      <div className="p-5 space-y-4">
        {/* Current bid / price */}
        {!isFixed && displayBid != null && (
          <div>
            <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1.5">
              {item?.currentBid ? 'Current Bid' : 'Starting Bid'}
            </p>
            <p
              className="font-mono font-black text-3xl xs:text-4xl text-text-light dark:text-text-dark leading-none"
              aria-live="polite"
            >
              {formatMoney(displayBid)}
            </p>
            {item?.bids.length > 0 && (
              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-1.5">
                {item?.bids.length} bid{item?.bids.length !== 1 ? 's' : ''}
                {topBid && (
                  <>
                    {' '}
                    · Top bidder:{' '}
                    <span className="text-text-light dark:text-text-dark">
                      {bidderDisplay(topBid)}
                    </span>
                  </>
                )}
              </p>
            )}
          </div>
        )}

        {/* Fixed price */}
        {isFixed && item?.buyNowPrice != null && (
          <div
            className={isFixed ? '' : 'pt-4 border-t border-border-light dark:border-border-dark'}
          >
            <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1.5">
              {isFixed ? 'Price' : 'Buy Now Price'}
            </p>
            <p
              className={`font-mono font-black leading-none ${isFixed ? 'text-3xl xs:text-4xl text-text-light dark:text-text-dark' : 'text-xl text-primary-light dark:text-primary-dark'}`}
            >
              {formatMoney(item?.buyNowPrice)}
            </p>
          </div>
        )}

        {/* Minimum bid info */}
        {item?.minimumBid != null && !isFixed && (
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
            Minimum bid:{' '}
            <span className="text-text-light dark:text-text-dark font-black">
              {formatMoney(item?.minimumBid)}
            </span>
          </p>
        )}

        {/* CTA */}
        {isActive && !isSold && (
          <div className="pt-2 space-y-2">
            {!isFixed ? (
              <button
                onClick={() =>
                  isAuthed
                    ? openBidModal()
                    : openSignInModal(`/auctions/${customAuctionLink}/${item.id}?bidModal=true`)
                }
                type="button"
                className="group w-full flex items-center justify-between px-5 py-4 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
                aria-label={`Place a bid on ${item?.name}`}
              >
                <div className="flex items-center gap-2">
                  <Gavel size={14} aria-hidden="true" />
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black">
                    Place a Bid
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </button>
            ) : item?.buyNowPrice != null ? (
              isAuthed ? (
                <Link
                  href={`/auctions/${customAuctionLink}/${item.id}/instant-buy`}
                  className="group w-full flex items-center justify-between px-5 py-4 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
                  aria-label={`Buy ${item?.name} now for ${formatMoney(item.buyNowPrice)}`}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} aria-hidden="true" />
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black">
                      Buy Now
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black">
                    {formatMoney(item.buyNowPrice)}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    openSignInModal(`/auctions/${customAuctionLink}/${item.id}/instant-buy`)
                  }
                  className="group w-full flex items-center justify-between px-5 py-4 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
                  aria-label={`Buy ${item?.name} now for ${formatMoney(item.buyNowPrice)}`}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} aria-hidden="true" />
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black">
                      Buy Now
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black">
                    {formatMoney(item.buyNowPrice)}
                  </span>
                </button>
              )
            ) : null}
          </div>
        )}

        {/* Ended state */}
        {isEnded && (
          <div className="pt-2 flex items-center gap-2 px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
            <Package
              size={13}
              className="text-muted-light dark:text-muted-dark shrink-0"
              aria-hidden="true"
            />
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
              {isSold ? 'This item has been sold.' : 'This auction has ended.'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
