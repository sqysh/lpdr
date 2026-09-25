'use client'

import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { Check, ChevronLeft, ChevronRight, Clock, Gavel, Loader2, Package, Zap } from 'lucide-react'
import Link, { useLinkStatus } from 'next/link'
import { useAuctionUiStore } from 'stores/auction-ui.store'
import { useQuickBid } from 'lib/hooks/useQuickBid.hook'
import { QUICK_BID_INCREMENT } from 'lib/constants/auction.constants'
import { useEffect, useRef } from 'react'

const BAR_CTA_BASE =
  'btn-shimmer group w-full min-h-12 flex items-center justify-center gap-2 px-5 py-3 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset'

/** Bidding is the house colour. Buying is green everywhere else on the site, so it is here too. */
const BAR_CTA_BID = `${BAR_CTA_BASE} bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark focus-visible:ring-white`
const BAR_CTA_BUY = `${BAR_CTA_BASE} bg-emerald-700 hover:bg-emerald-800 focus-visible:ring-white`

const CTA_LABEL = 'text-[11px] font-mono tracking-eyebrow uppercase font-black'

const STEP_CLASS =
  'flex items-center gap-2 px-4 py-3 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark shrink-0'

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

  // The label block is hidden below sm, so on a phone the spinner replacing the chevron is the only feedback
  const label = (
    <div className={`hidden sm:block ${direction === 'prev' ? 'text-left' : 'text-right'}`}>
      <p className="text-[10px] font-mono uppercase tracking-eyebrow text-muted-light dark:text-muted-dark">
        {direction === 'prev' ? 'Prev' : 'Next'}
      </p>
      <p className="text-[11px] font-mono font-black truncate max-w-25">{pending ? 'Loading' : name}</p>
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
      <span className="text-[11px] font-mono font-black opacity-90">{price}</span>
    </>
  )
}

export function AuctionItemFixedFooterNav({ auctionItems, item, customAuctionLink, isFixed, isAuthed, isTopBidder }) {
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)
  const quickBid = useQuickBid(item)

  const currentIndex = auctionItems?.findIndex((i) => i.id === item.id) ?? -1
  const prev = currentIndex > 0 ? auctionItems[currentIndex - 1] : null
  const next = currentIndex > -1 ? auctionItems[currentIndex + 1] : null

  const status = item?.auction?.status
  const isSold = item?.status === 'SOLD'
  // Bidding and buying only while the auction is live and the item is still available. Otherwise the
  // middle of the bar says why, and the bar is just for moving between items
  const isOpen = status === 'ACTIVE' && !isSold

  const closedMessage = isSold
    ? 'Sold'
    : status === 'DRAFT'
      ? `Opens ${item.auction.startDate ? formatDate(item.auction.startDate, true) : 'soon'}`
      : 'Auction ended'

  // Hidden while the viewer is already winning: a fixed increment with no amount to choose can only
  // raise their own price. The bid panel stays available for a deliberate self-raise
  const showQuickBid = isOpen && !isFixed && isAuthed && !isTopBidder

  const goToBidPanel = () => {
    document.getElementById('bid-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.getElementById('bid-amount')?.focus({ preventScroll: true })
  }

  const navRef = useRef<HTMLElement>(null)

  // Publishes the bar's height so other fixed-bottom elements, like the cookie notice, sit above it
  // instead of on top of it. Measured rather than hardcoded, since the safe-area padding varies by phone
  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const root = document.documentElement
    const publish = () => root.style.setProperty('--bottom-bar-height', `${el.offsetHeight}px`)

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)

    return () => {
      observer.disconnect()
      root.style.removeProperty('--bottom-bar-height')
    }
  }, [])

  return (
    <nav
      ref={navRef}
      aria-label="Auction item navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-light dark:bg-bg-dark border-t border-border-light dark:border-border-dark pb-[env(safe-area-inset-bottom)]"
    >
      {/* Always present so the terms are announced when they appear. They sit above the bar so arming doesn't resize it */}
      <div id="footer-quick-bid-terms" aria-live="polite" className="absolute bottom-full left-0 right-0">
        {quickBid.confirming && !quickBid.bidding && (
          <div className="border-t border-amber-600/40 bg-amber-50/95 dark:bg-amber-950/90 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 px-4 py-2.5">
              <p className="text-[11px] font-mono leading-relaxed text-amber-800 dark:text-amber-300">
                Tap again to confirm. Bids are binding: if you win, payment is due and all sales are final.
              </p>
              <button
                type="button"
                onClick={quickBid.cancel}
                className="shrink-0 h-9 px-2 text-[11px] font-mono underline underline-offset-4 text-amber-800 dark:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {quickBid.error && (
        <div className="absolute bottom-full left-0 right-0 border-t border-red-600/40 bg-red-50/95 dark:bg-red-950/90">
          <p role="alert" className="max-w-4xl mx-auto px-4 py-2.5 text-[11px] font-mono text-red-700 dark:text-red-400">
            {quickBid.error}
          </p>
        </div>
      )}

      <div className="max-w-4xl mx-auto flex items-stretch">
        {prev ? (
          <Link href={`/auctions/${customAuctionLink}/${prev.id}`} className={STEP_CLASS} aria-label={`Prev item: ${prev.name}`}>
            <StepBody name={prev.name} direction="prev" />
          </Link>
        ) : (
          <div className="px-4 py-3 shrink-0 opacity-0 pointer-events-none" aria-hidden="true">
            <ChevronLeft size={14} />
          </div>
        )}

        <div className="flex-1 flex items-stretch gap-px min-w-0 relative overflow-hidden">
          {!isOpen ? (
            <p className="flex-1 min-h-12 flex items-center justify-center gap-2 px-3 text-[11px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark text-center">
              {status === 'DRAFT' ? (
                <Clock size={13} className="shrink-0" aria-hidden="true" />
              ) : (
                <Package size={13} className="shrink-0" aria-hidden="true" />
              )}
              <span className="truncate">{closedMessage}</span>
            </p>
          ) : (
            <>
              {showQuickBid && (
                <button
                  type="button"
                  onClick={quickBid.press}
                  disabled={quickBid.bidding}
                  aria-describedby="footer-quick-bid-terms"
                  aria-label={
                    quickBid.confirming
                      ? `Tap again to confirm a bid of ${formatMoney(quickBid.amount)}`
                      : `+${formatMoney(QUICK_BID_INCREMENT)}, bid ${formatMoney(quickBid.amount)}`
                  }
                  className={`shrink-0 min-h-12 flex items-center justify-center gap-2 px-4 py-3 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:opacity-60 disabled:cursor-not-allowed ${
                    quickBid.confirming
                      ? 'bg-amber-700 text-white focus-visible:ring-white'
                      : 'bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-800 dark:bg-violet-400/10 dark:hover:bg-violet-400/20 dark:text-violet-300 focus-visible:ring-cyan-700 dark:focus-visible:ring-violet-400'
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
                  <span className="hidden xs:inline text-[11px] font-mono font-black opacity-90">{formatMoney(quickBid.amount)}</span>
                </button>
              )}

              {!isFixed ? (
                <button
                  type="button"
                  onClick={() => (isAuthed ? goToBidPanel() : openSignInModal(`/auctions/${customAuctionLink}/${item.id}?bidModal=true`))}
                  className={BAR_CTA_BID}
                >
                  <Gavel size={14} aria-hidden="true" />
                  <span className={CTA_LABEL}>{isTopBidder ? 'Raise Your Bid' : 'Place a Bid'}</span>
                  {item?.currentBid != null && (
                    <span className="hidden xs:inline text-[11px] font-mono font-black opacity-90">{formatMoney(item.currentBid)}</span>
                  )}
                </button>
              ) : item?.buyNowPrice != null ? (
                isAuthed ? (
                  <Link href={`/auctions/${customAuctionLink}/${item.id}/instant-buy`} className={BAR_CTA_BUY}>
                    <BuyNowBarBody price={formatMoney(item.buyNowPrice)} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => openSignInModal(`/auctions/${customAuctionLink}/${item.id}/instant-buy`)}
                    className={BAR_CTA_BUY}
                  >
                    <Zap size={14} aria-hidden="true" />
                    <span className={CTA_LABEL}>Buy Now</span>
                    <span className="text-[11px] font-mono font-black opacity-90">{formatMoney(item.buyNowPrice)}</span>
                  </button>
                )
              ) : null}
            </>
          )}
        </div>

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
