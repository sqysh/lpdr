import { formatMoney } from 'lib/utils/currency.utils'
import { Check, ChevronRight, Eye, Loader2, TrendingUp, Trophy, Zap } from 'lucide-react'
import Link, { useLinkStatus } from 'next/link'

function CardLinkBody({ label, icon }: { label: string; icon: React.ReactNode }) {
  const { pending } = useLinkStatus()

  return (
    <>
      <span className="text-f9 font-mono tracking-eyebrow uppercase font-black relative z-10">{pending ? 'Opening' : label}</span>
      <span className="relative z-10">{pending ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : icon}</span>
    </>
  )
}

function YourBidBadge({ myBid }: { myBid: { status: string; bidAmount: number } | null }) {
  if (!myBid) return null

  const isTopBid = myBid.status === 'TOP_BID'

  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2 border text-f9 font-mono tracking-eyebrow uppercase font-black ${
        isTopBid
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400'
      }`}
      role="status"
    >
      <span className="inline-flex items-center gap-1.5">
        {isTopBid ? <Trophy size={11} aria-hidden="true" /> : <TrendingUp size={11} aria-hidden="true" />}
        {isTopBid ? 'You are the top bid' : 'You were outbid'}
      </span>
      <span className="opacity-80">{formatMoney(myBid.bidAmount)}</span>
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

  // Instant buy skips the detail page. Bidding goes there with the flag that focuses the panel.
  const primaryHref = isFixed ? `${itemHref}/instant-buy` : `${itemHref}?bidModal=true`

  // Only meaningful on an auction item: a fixed item has no bids to be top of.
  const isTopBid = !isFixed && myBid?.status === 'TOP_BID'

  return (
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
        {!isFixed && !isUpcoming && (
          <div className="flex items-center justify-between">
            <span className="text-f9 font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">Bids</span>
            <span className="text-f10 font-mono text-muted-light dark:text-muted-dark">{bidCount}</span>
          </div>
        )}

        {/* Price */}
        {!isUpcoming && displayPrice != null && (
          <div className="flex items-center justify-between">
            <span className="text-f9 font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
              {isFixed ? 'Price' : !item.currentBid ? 'Starting' : 'Current Bid'}
            </span>
            <span className="font-mono font-black text-sm text-text-light dark:text-text-dark">{formatMoney(displayPrice)}</span>
          </div>
        )}

        {/* Upcoming: preview only, no bidding path */}
        {isUpcoming && (
          <p className="mt-2 px-3.5 py-2.5 border border-border-light dark:border-border-dark text-f9 font-mono tracking-eyebrow uppercase font-black text-muted-light dark:text-muted-dark text-center">
            {isFixed ? 'Available Soon' : 'Bidding Opens Soon'}
          </p>
        )}

        {auctionStatus === 'ACTIVE' && !isSold && (
          <div className="mt-2 space-y-1.5">
            {!isFixed && <YourBidBadge myBid={myBid} />}

            {/* ── Auction item ── */}
            {!isFixed && !isTopBid && (
              <>
                <button
                  type="button"
                  onClick={handleQuickBid}
                  disabled={quickBidLoading}
                  aria-describedby={confirming ? `quick-bid-terms-${item.id}` : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 text-f9 font-mono tracking-eyebrow uppercase font-black disabled:opacity-50 disabled:cursor-not-allowed ${
                    confirming ? 'bg-amber-400 text-amber-950' : 'bg-amber-500 hover:bg-amber-400 text-white'
                  }`}
                >
                  <span>
                    {quickBidLoading
                      ? 'Bidding...'
                      : confirming
                        ? `Confirm ${formatMoney(quickBidAmount)}?`
                        : `Quick Bid ${formatMoney(quickBidAmount)}`}
                  </span>
                  {quickBidLoading ? (
                    <Loader2 size={10} className="animate-spin" aria-hidden="true" />
                  ) : confirming ? (
                    <Check size={10} aria-hidden="true" />
                  ) : (
                    <Zap size={10} aria-hidden="true" />
                  )}
                </button>

                {/* A bid is binding, and quick bid is one tap away from being placed. The terms
                    appear with the confirm step so they are read at the moment of committing. */}
                {confirming && !quickBidLoading && (
                  <p
                    id={`quick-bid-terms-${item.id}`}
                    className="px-3.5 py-2 border border-amber-500/40 bg-amber-500/10 text-f9 font-mono leading-relaxed text-amber-700 dark:text-amber-300"
                  >
                    Bids are binding. If you win, payment is due and all sales are final, so there are no refunds or cancellations.
                  </p>
                )}

                {quickBidError && <p className="text-f9 font-mono text-red-500 dark:text-red-400">{quickBidError}</p>}
              </>
            )}

            {/* Already winning: raising your own bid costs money and changes nothing. */}
            {isTopBid && (
              <p className="px-3.5 py-2.5 border border-border-light dark:border-border-dark text-f9 font-mono leading-relaxed text-muted-light dark:text-muted-dark text-center">
                Nothing to do, you are ahead. We will email you if someone outbids you.
              </p>
            )}

            {/* ── Primary CTA: buy for a fixed item, bid for an auction item ── */}
            {isFixed && (
              <Link
                href={primaryHref}
                className="btn-shimmer relative overflow-hidden group/btn flex items-center justify-between px-3.5 py-2.5 text-white transition-colors focus:outline-none focus-visible:ring-2 bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500"
                aria-label={`Buy ${item.name} for ${formatMoney(item.buyNowPrice)}`}
              >
                <CardLinkBody
                  label="Buy Now"
                  icon={<ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />}
                />
              </Link>
            )}

            {/* Everything else about the item: full description, photos, bid history */}
            <Link
              href={itemHref}
              className="flex items-center justify-between px-3.5 py-2.5 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              aria-label={`View details for ${item.name}`}
            >
              <CardLinkBody label="View item" icon={<Eye size={12} aria-hidden="true" />} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
