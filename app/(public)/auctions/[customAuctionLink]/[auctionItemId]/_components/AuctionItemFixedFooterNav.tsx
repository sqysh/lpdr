'use client'

import { formatMoney } from 'lib/utils/currency.utils'
import { Check, ChevronLeft, ChevronRight, Gavel, Loader2, Zap } from 'lucide-react'
import Link, { useLinkStatus } from 'next/link'
import { useAuctionUiStore } from 'stores/auction-ui.store'
import { useQuickBid } from 'lib/hooks/useQuickBid.hook'
import { QUICK_BID_INCREMENT } from 'lib/constants/auction.constants'

const BAR_CTA_BASE =
  'btn-shimmer group w-full flex items-center justify-center gap-2 px-5 py-3 text-white transition-colors focus:outline-none focus-visible:ring-2'

/** Bidding is the house colour. Buying is green everywhere else on the site, so it is here too. */
const BAR_CTA_BID = `${BAR_CTA_BASE} bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark`
const BAR_CTA_BUY = `${BAR_CTA_BASE} bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500`

const CTA_LABEL = 'text-f10 font-mono tracking-eyebrow uppercase font-black'

const STEP_CLASS =
  'flex items-center gap-2 px-4 py-3 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus-visible:outline-none shrink-0'

/** useLinkStatus only reports on a navigation, so it has to live inside the Link. */
function StepBody({ name, direction }: { name: string; direction: 'prev' | 'next' }) {
  const { pending } = useLinkStatus()

  const icon = pending ? (
    <Loader2 size={14} className="animate-spin shrink-0" aria-hidden="true" />
  ) : direction === 'prev' ? (
    <ChevronLeft size={14} className="shrink-0" aria-hidden="true" />
  ) : (
    <ChevronRight size={14} className="shrink-0" aria-hidden="true" />
  )

  // The label block is hidden below sm, so on a phone the spinner replacing the chevron is the
  // only feedback there is.
  const label = (
    <div className={`hidden sm:block ${direction === 'prev' ? 'text-left' : 'text-right'}`}>
      <p className="text-f9 font-mono uppercase tracking-eyebrow text-muted-light dark:text-muted-dark">
        {direction === 'prev' ? 'Prev' : 'Next'}
      </p>
      <p className="text-f10 font-mono font-black truncate max-w-25">{pending ? 'Loading' : name}</p>
    </div>
  )

  return direction === 'prev' ? (
    <>
      {icon}
      {label}
    </>
  ) : (
    <>
      {label}
      {icon}
    </>
  )
}

function BuyNowBarBody({ price }: { price: string }) {
  const { pending } = useLinkStatus()

  return (
    <>
      {pending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Zap size={14} aria-hidden="true" />}
      <span className={CTA_LABEL}>{pending ? 'Opening' : 'Buy Now'}</span>
      <span className="text-f10 font-mono font-black opacity-80">{price}</span>
    </>
  )
}

export function AuctionItemFixedFooterNav({ auctionItems, item, customAuctionLink, isFixed, isAuthed, isTopBidder }) {
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)
  const quickBid = useQuickBid(item)

  const currentIndex = auctionItems?.findIndex((i) => i.id === item.id) ?? -1
  const prev = currentIndex > 0 ? auctionItems[currentIndex - 1] : null
  const next = currentIndex > -1 ? auctionItems[currentIndex + 1] : null

  // Hidden while the viewer is already winning: a fixed increment with no amount to choose can
  // only raise their own price. The modal stays available for a deliberate self-raise.
  const showQuickBid = !isFixed && isAuthed && !isTopBidder

  const goToBidPanel = () => {
    document.getElementById('bid-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.getElementById('bid-amount')?.focus({ preventScroll: true })
  }

  return (
    <nav
      aria-label="Auction item navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-light dark:bg-bg-dark border-t border-border-light dark:border-border-dark"
    >
      {/* Terms sit above the bar rather than inside it, so arming does not resize the footer. */}
      {quickBid.confirming && !quickBid.bidding && (
        <div className="absolute bottom-full left-0 right-0 border-t border-amber-500/40 bg-amber-500/10 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto flex items-start justify-between gap-3 px-4 py-2.5">
            <p id="footer-quick-bid-terms" className="text-f9 font-mono leading-relaxed text-amber-700 dark:text-amber-300">
              If you win, payment is due and all sales are final. There are no refunds or cancellations.
            </p>
            <button
              type="button"
              onClick={quickBid.cancel}
              className="shrink-0 text-f9 font-mono underline underline-offset-4 text-amber-700/80 dark:text-amber-300/80 hover:text-amber-700 dark:hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {quickBid.error && (
        <div className="absolute bottom-full left-0 right-0 border-t border-red-500/40 bg-red-500/10">
          <p role="alert" className="max-w-4xl mx-auto px-4 py-2.5 text-f9 font-mono text-red-600 dark:text-red-400">
            {quickBid.error}
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto flex items-stretch">
        {/* Prev */}
        {prev ? (
          <Link href={`/auctions/${customAuctionLink}/${prev.id}`} className={STEP_CLASS} aria-label={`Previous item: ${prev.name}`}>
            <StepBody name={prev.name} direction="prev" />
          </Link>
        ) : (
          <div className="px-4 py-3 shrink-0 opacity-0 pointer-events-none" aria-hidden="true">
            <ChevronLeft size={14} />
          </div>
        )}

        {/* Bid / Buy */}
        <div className="flex-1 flex items-stretch gap-px min-w-0 relative overflow-hidden">
          {showQuickBid && (
            <button
              type="button"
              onClick={quickBid.press}
              disabled={quickBid.bidding}
              aria-describedby={quickBid.confirming ? 'footer-quick-bid-terms' : undefined}
              aria-label={
                quickBid.confirming
                  ? `Confirm instant bid of ${formatMoney(quickBid.amount)}`
                  : `Instant bid ${formatMoney(quickBid.amount)}`
              }
              className={`shrink-0 flex items-center justify-center gap-2 px-4 py-3 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:opacity-50 disabled:cursor-not-allowed ${
                quickBid.confirming
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 focus-visible:ring-amber-500'
                  : 'bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-700 dark:bg-violet-400/10 dark:hover:bg-violet-400/20 dark:text-violet-400 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400'
              }`}
            >
              {quickBid.bidding ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : quickBid.confirming ? (
                <Check size={14} aria-hidden="true" />
              ) : (
                <Zap size={14} aria-hidden="true" />
              )}
              <span className={CTA_LABEL}>
                {quickBid.bidding ? 'Bidding' : quickBid.confirming ? 'Tap again' : `+${formatMoney(QUICK_BID_INCREMENT)}`}
              </span>
              <span className="hidden xs:inline text-f10 font-mono font-black opacity-80">{formatMoney(quickBid.amount)}</span>
            </button>
          )}

          {!isFixed ? (
            <button
              onClick={() => (isAuthed ? goToBidPanel() : openSignInModal(`/auctions/${customAuctionLink}/${item.id}?bidModal=true`))}
              type="button"
              className={BAR_CTA_BID}
              aria-label={`${isTopBidder ? 'Raise your bid on' : 'Place a bid on'} ${item?.name}`}
            >
              <Gavel size={14} aria-hidden="true" />
              <span className={CTA_LABEL}>{isTopBidder ? 'Raise Your Bid' : 'Place a Bid'}</span>
              {item?.currentBid != null && (
                <span className="hidden xs:inline text-f10 font-mono font-black opacity-80">{formatMoney(item.currentBid)}</span>
              )}
            </button>
          ) : item?.buyNowPrice != null ? (
            isAuthed ? (
              <Link
                href={`/auctions/${customAuctionLink}/${item.id}/instant-buy`}
                className={BAR_CTA_BUY}
                aria-label={`Buy ${item?.name} now for ${formatMoney(item.buyNowPrice)}`}
              >
                <BuyNowBarBody price={formatMoney(item.buyNowPrice)} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openSignInModal(`/auctions/${customAuctionLink}/${item.id}/instant-buy`)}
                className={BAR_CTA_BUY}
                aria-label={`Buy ${item?.name} now for ${formatMoney(item.buyNowPrice)}`}
              >
                <Zap size={14} aria-hidden="true" />
                <span className={CTA_LABEL}>Buy Now</span>
                <span className="text-f10 font-mono font-black opacity-80">{formatMoney(item.buyNowPrice)}</span>
              </button>
            )
          ) : null}
        </div>

        {/* Next */}
        {next ? (
          <Link href={`/auctions/${customAuctionLink}/${next.id}`} className={STEP_CLASS} aria-label={`Next item: ${next.name}`}>
            <StepBody name={next.name} direction="next" />
          </Link>
        ) : (
          <div className="px-4 py-3 shrink-0 opacity-0 pointer-events-none" aria-hidden="true">
            <ChevronRight size={14} />
          </div>
        )}
      </div>
    </nav>
  )
}
