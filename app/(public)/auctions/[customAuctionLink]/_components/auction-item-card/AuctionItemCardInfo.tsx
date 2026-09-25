import { formatMoney } from 'lib/utils/currency.utils'
import { Check, ChevronRight, Eye, Loader2, TrendingUp, Trophy, Zap } from 'lucide-react'
import Link, { useLinkStatus } from 'next/link'

function CardLinkBody({ label, icon }: { label: string; icon: React.ReactNode }) {
  const { pending } = useLinkStatus()

  return (
    <>
      <span className="text-[10px] font-mono tracking-tag uppercase font-black relative z-10">{pending ? 'Opening' : label}</span>
      <span className="relative z-10">{pending ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : icon}</span>
    </>
  )
}

function YourBidBadge({ myBid }: { myBid: { status: string; bidAmount: number } | null }) {
  if (!myBid) return null

  const isTopBid = myBid.status === 'TOP_BID'

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 px-3 py-2 border text-[10px] font-mono tracking-tag uppercase font-black ${
        isTopBid
          ? 'border-emerald-600/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-400'
      }`}
    >
      <span className="inline-flex items-center gap-1.5">
        {isTopBid ? <Trophy size={11} aria-hidden="true" /> : <TrendingUp size={11} aria-hidden="true" />}
        {isTopBid ? 'Top bid' : 'Outbid'}
      </span>
      <span className="tabular-nums">{formatMoney(myBid.bidAmount)}</span>
    </div>
  )
}

export function AuctionItemCardInfo(props) {
  const {
    isSold,
    isUpcoming,
    auctionStatus,
    item,
    handleQuickBid,
    quickBidLoading,
    confirming,
    quickBidAmount,
    quickBidError,
    customAuctionLink,
    myBid
  } = props

  const isFixed = item.sellingFormat === 'FIXED'
  const displayPrice = isFixed ? item.buyNowPrice : (item.currentBid ?? item.startingPrice)
  const bidCount = item._count?.bids ?? 0

  const itemHref = `/auctions/${customAuctionLink}/${item.id}`
  const primaryHref = isFixed ? `${itemHref}/instant-buy` : `${itemHref}?bidModal=true`

  // Only meaningful on an auction item: a fixed item has no bids to be top of
  const isTopBid = !isFixed && myBid?.status === 'TOP_BID'
  const termsId = `quick-bid-terms-${item.id}`

  return (
    <div className="flex flex-col flex-1 p-3 sm:p-4">
      <div className="flex-1">
        <h3 className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug mb-2 line-clamp-2">
          {item.name}
        </h3>
        {/* Hidden at two columns on a phone, where the card is too narrow for it to add anything */}
        <p className="xs:max-sm:hidden text-xs font-nunito text-muted-light dark:text-muted-dark leading-relaxed mb-3 line-clamp-2">
          {item.description}
        </p>
      </div>

      <dl className="space-y-1.5">
        {!isFixed && !isUpcoming && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">Bids</dt>
            <dd className="text-[11px] font-mono tabular-nums text-muted-light dark:text-muted-dark">{bidCount}</dd>
          </div>
        )}

        {displayPrice != null && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
              {isFixed ? 'Price' : !item.currentBid ? 'Starting' : 'Current'}
            </dt>
            <dd className="font-mono font-black text-sm tabular-nums text-text-light dark:text-text-dark">{formatMoney(displayPrice)}</dd>
          </div>
        )}
      </dl>

      {isUpcoming && (
        <p className="mt-3 px-3 py-2.5 border border-border-light dark:border-border-dark text-[10px] font-mono tracking-tag uppercase font-black text-muted-light dark:text-muted-dark text-center">
          {isFixed ? 'Available Soon' : 'Bidding Opens Soon'}
        </p>
      )}

      {auctionStatus === 'ACTIVE' && !isSold && (
        <div className="mt-3 space-y-1.5">
          {!isFixed && <YourBidBadge myBid={myBid} />}

          {!isFixed && !isTopBid && (
            <>
              <button
                type="button"
                onClick={handleQuickBid}
                disabled={quickBidLoading}
                aria-describedby={termsId}
                className={`w-full min-h-11 flex items-center justify-between gap-2 px-3 py-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-600 text-[10px] font-mono tracking-tag uppercase font-black disabled:opacity-60 disabled:cursor-not-allowed ${
                  confirming ? 'bg-amber-700 text-white' : 'bg-amber-400 hover:bg-amber-300 text-amber-950'
                }`}
              >
                <span className="truncate">
                  {quickBidLoading
                    ? 'Bidding'
                    : confirming
                      ? `Confirm ${formatMoney(quickBidAmount)}`
                      : `Bid ${formatMoney(quickBidAmount)}`}
                </span>
                {quickBidLoading ? (
                  <Loader2 size={12} className="shrink-0 animate-spin" aria-hidden="true" />
                ) : confirming ? (
                  <Check size={12} className="shrink-0" aria-hidden="true" />
                ) : (
                  <Zap size={12} className="shrink-0" aria-hidden="true" />
                )}
              </button>

              {/* Always in the page, so the terms are announced when they appear at the confirm step,
                  the moment a bid is one tap from being placed and binding */}
              <div id={termsId} aria-live="polite">
                {confirming && !quickBidLoading && (
                  <p className="px-3 py-2 border border-amber-600/40 bg-amber-500/10 text-[11px] font-mono leading-relaxed text-amber-800 dark:text-amber-300">
                    Tap again to confirm. Bids are binding: if you win, payment is due and all sales are final.
                  </p>
                )}
              </div>

              {quickBidError && (
                <p role="alert" className="text-[11px] font-mono leading-relaxed text-red-600 dark:text-red-400">
                  {quickBidError}
                </p>
              )}
            </>
          )}

          {isTopBid && (
            <p className="px-3 py-2.5 border border-border-light dark:border-border-dark text-[11px] font-mono leading-relaxed text-muted-light dark:text-muted-dark text-center">
              You&apos;re ahead. We&apos;ll email you if someone outbids you.
            </p>
          )}

          {isFixed && (
            <Link
              href={primaryHref}
              aria-label={`Buy Now: ${item.name}, ${formatMoney(item.buyNowPrice)}`}
              className="btn-shimmer relative overflow-hidden group/btn min-h-11 flex items-center justify-between px-3 py-2 text-white bg-emerald-700 hover:bg-emerald-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-700"
            >
              <CardLinkBody
                label="Buy Now"
                icon={
                  <ChevronRight size={12} className="motion-safe:group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
                }
              />
            </Link>
          )}
        </div>
      )}

      {/* On every card, whatever the status: before opening it's how people preview, after closing how they see what sold */}
      <Link
        href={itemHref}
        aria-label={`${isUpcoming ? 'Preview item' : 'View item'}: ${item.name}`}
        className={`${auctionStatus === 'ACTIVE' && !isSold ? 'mt-1.5' : 'mt-3'} min-h-11 flex items-center justify-between px-3 py-2 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark`}
      >
        <CardLinkBody label={isUpcoming ? 'Preview item' : 'View item'} icon={<Eye size={12} aria-hidden="true" />} />
      </Link>
    </div>
  )
}
