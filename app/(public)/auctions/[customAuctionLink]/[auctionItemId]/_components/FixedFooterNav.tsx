import { formatMoney } from 'lib/utils/currency.utils'
import { ChevronLeft, ChevronRight, Gavel, Zap } from 'lucide-react'
import Link from 'next/link'
import { useAuctionUiStore } from 'stores/auction-ui.store'

export function FixedFooterNav({ auctionItems, item, customAuctionLink, isFixed, isAuthed }) {
  const openBidModal = useAuctionUiStore((s) => s.openBidModal)
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)

  return (
    <nav
      aria-label="Auction item navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-light dark:bg-bg-dark border-t border-border-light dark:border-border-dark"
    >
      <div className="max-w-4xl mx-auto flex items-stretch">
        {/* Prev */}
        {(() => {
          const currentIndex = auctionItems.findIndex((i) => i.id === item.id)
          const prev = auctionItems[currentIndex - 1]
          return prev ? (
            <Link
              href={`/auctions/${customAuctionLink}/${prev.id}`}
              className="flex items-center gap-2 px-4 py-3 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus-visible:outline-none shrink-0"
              aria-label={`Previous item: ${prev.name}`}
            >
              <ChevronLeft size={14} aria-hidden="true" />
              <div className="hidden sm:block text-left">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-light dark:text-muted-dark">
                  Prev
                </p>
                <p className="text-[10px] font-mono font-black truncate max-w-25">{prev.name}</p>
              </div>
            </Link>
          ) : (
            <div className="px-4 py-3 shrink-0 opacity-0 pointer-events-none">
              <ChevronLeft size={14} />
            </div>
          )
        })()}

        {/* Bid / Buy */}
        <div className="flex-1 flex items-stretch">
          {!isFixed ? (
            <button
              onClick={() =>
                isAuthed
                  ? openBidModal()
                  : openSignInModal(`/auctions/${customAuctionLink}/${item.id}?bidModal=true`)
              }
              type="button"
              className="group w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              aria-label={`Place a bid on ${item?.name}`}
            >
              <Gavel size={14} aria-hidden="true" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black">
                Place a Bid
              </span>
              {item?.currentBid && (
                <span className="text-[10px] font-mono font-black opacity-80">
                  — {formatMoney(item.currentBid)}
                </span>
              )}
            </button>
          ) : item?.buyNowPrice != null ? (
            isAuthed ? (
              <Link
                href={`/auctions/${customAuctionLink}/${item.id}/instant-buy`}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                aria-label={`Buy ${item?.name} now for ${formatMoney(item.buyNowPrice)}`}
              >
                <Zap size={14} aria-hidden="true" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black">
                  Buy Now
                </span>
                <span className="text-[10px] font-mono font-black opacity-80">
                  — {formatMoney(item.buyNowPrice)}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  openSignInModal(`/auctions/${customAuctionLink}/${item.id}/instant-buy`)
                }
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                aria-label={`Buy ${item?.name} now for ${formatMoney(item.buyNowPrice)}`}
              >
                <Zap size={14} aria-hidden="true" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black">
                  Buy Now
                </span>
                <span className="text-[10px] font-mono font-black opacity-80">
                  — {formatMoney(item.buyNowPrice)}
                </span>
              </button>
            )
          ) : null}
        </div>

        {/* Next */}
        {(() => {
          const currentIndex = auctionItems.findIndex((i) => i.id === item.id)
          const next = auctionItems[currentIndex + 1]
          return next ? (
            <Link
              href={`/auctions/${customAuctionLink}/${next.id}`}
              className="flex items-center gap-2 px-4 py-3 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus-visible:outline-none shrink-0"
              aria-label={`Next item: ${next.name}`}
            >
              <div className="hidden sm:block text-right">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-light dark:text-muted-dark">
                  Next
                </p>
                <p className="text-[10px] font-mono font-black truncate max-w-25">{next.name}</p>
              </div>
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          ) : (
            <div className="px-4 py-3 shrink-0 opacity-0 pointer-events-none">
              <ChevronRight size={14} />
            </div>
          )
        })()}
      </div>
    </nav>
  )
}
