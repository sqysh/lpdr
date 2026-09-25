'use client'

import { useBidPanel } from '@hooks/useBidPanel.hook'
import { Clock, Gavel, Loader2, Package, Zap } from 'lucide-react'
import Link, { useLinkStatus } from 'next/link'
import { formatMoney } from 'lib/utils/currency.utils'
import { useAuctionUiStore } from 'stores/auction-ui.store'
import { PublicAuctionItem, PublicBid } from 'types/auction.types'
import { BidError, BidPlaced, CurrentPrice, EYEBROW, QuickBidButton, RaceConditionNotice, StandingBanner } from './AuctionItemBidPanelParts'
import { AuctionItemBidPanelBidAmountForm } from './AuctionItemBidPanelBidAmountForm'
import { formatDate } from 'lib/utils/date.utils'

const PANEL = 'border border-border-light dark:border-border-dark'
const CTA =
  'btn-shimmer relative overflow-hidden w-full flex items-center justify-between gap-2 px-5 py-4 text-white transition-colors focus:outline-none focus-visible:ring-2'

type Props = {
  item: PublicAuctionItem
  isAuthed: boolean
  isTopBidder: boolean
  customAuctionLink: string
  topBid: PublicBid | undefined
  myTopBid: PublicBid | null
  currentUserId: string | null
}

function BuyNowBody({ price }: { price: string }) {
  const { pending } = useLinkStatus()

  return (
    <>
      <span className="flex items-center gap-2">
        {pending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Zap size={14} aria-hidden="true" />}
        <span className="text-f10 font-mono tracking-eyebrow uppercase font-black">{pending ? 'Opening' : 'Buy Now'}</span>
      </span>
      <span className="font-mono font-black text-lg tabular-nums">{price}</span>
    </>
  )
}

export function AuctionItemBidPanel({ item, isAuthed, isTopBidder, customAuctionLink, topBid, myTopBid, currentUserId }: Props) {
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)
  const panel = useBidPanel(item)

  const isUpcoming = item?.auction?.status === 'DRAFT'
  const isFixed = item?.sellingFormat === 'FIXED'
  const isActive = item?.auction?.status === 'ACTIVE'
  const isSold = item?.status === 'SOLD'
  const myBidCount = currentUserId ? item.bids.filter((b) => b.userId === currentUserId).length : 0

  const signInHref = isFixed
    ? `/auctions/${customAuctionLink}/${item.id}/instant-buy`
    : `/auctions/${customAuctionLink}/${item.id}?bidModal=true`

  const price = isFixed ? (
    <CurrentPrice label="Price" amount={Number(item.buyNowPrice ?? 0)} />
  ) : (
    <CurrentPrice
      label={panel.bidCount > 0 ? 'Current Bid' : 'Starting Bid'}
      amount={panel.currentBid}
      bidCount={panel.bidCount}
      topBidderName={topBid?.displayName}
    />
  )

  // ── Closed: sold, or the auction is over. Price only, no way in. ──
  // ── Not open: upcoming, sold, or over. Price only, no way in, and a message that says which ──
  if (isSold || !isActive) {
    const message = isSold
      ? 'This item has been sold.'
      : isUpcoming
        ? `Bidding opens ${item.auction.startDate ? formatDate(item.auction.startDate, true) : 'soon'}.`
        : 'This auction has ended.'

    return (
      <div id="bid-panel" className={PANEL}>
        <div className="h-0.5 bg-border-light dark:bg-border-dark" aria-hidden="true" />
        <div className="p-5 space-y-4">
          {price}
          <div className="flex items-center gap-2 px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
            {isUpcoming ? (
              <Clock size={13} className="text-muted-light dark:text-muted-dark shrink-0" aria-hidden="true" />
            ) : (
              <Package size={13} className="text-muted-light dark:text-muted-dark shrink-0" aria-hidden="true" />
            )}
            <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Signed out. Same shape either way, different verb. ──
  if (!isAuthed) {
    return (
      <div id="bid-panel" className={`${PANEL} p-5 space-y-3`}>
        <p className={EYEBROW}>{isFixed ? 'Buy this item' : 'Place a bid'}</p>
        <p className="text-xs font-nunito text-muted-light dark:text-muted-dark leading-relaxed">
          {isFixed
            ? 'Sign in to buy this item. It takes a moment, and your order confirmation goes straight to your email.'
            : 'Sign in to bid on this item. It takes a moment, and we will email you if someone outbids you.'}
        </p>
        <button
          type="button"
          onClick={() => openSignInModal(signInHref)}
          className={`${CTA} bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark`}
        >
          <span className="flex items-center gap-2">
            {isFixed ? <Zap size={14} aria-hidden="true" /> : <Gavel size={14} aria-hidden="true" />}
            <span className="text-f10 font-mono tracking-eyebrow uppercase font-black">
              {isFixed ? 'Sign in to buy' : 'Sign in to bid'}
            </span>
          </span>
        </button>
      </div>
    )
  }

  // ── Instant buy. One price, one button, no bidding machinery. ──
  if (isFixed) {
    return (
      <div id="bid-panel" className={PANEL}>
        <div className="h-0.5 bg-emerald-600" aria-hidden="true" />
        <div className="p-5 space-y-4">
          {price}
          <Link
            href={`/auctions/${customAuctionLink}/${item.id}/instant-buy`}
            className={`${CTA} bg-emerald-600 hover:bg-emerald-500 focus-visible:ring-emerald-500`}
            aria-label={`Buy ${item.name} for ${formatMoney(Number(item.buyNowPrice ?? 0))}`}
          >
            <BuyNowBody price={formatMoney(Number(item.buyNowPrice ?? 0))} />
          </Link>
          <p className="text-f9 font-mono text-muted-light dark:text-muted-dark leading-relaxed">
            {item.requiresShipping
              ? `Shipping is ${formatMoney(Number(item.shippingCosts ?? 0))}, added at checkout. All sales are final.`
              : 'No shipping needed. All sales are final.'}
          </p>
        </div>
      </div>
    )
  }

  // ── Auction item ──
  return (
    <div id="bid-panel" className={PANEL}>
      <div className="h-0.5 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />

      <div className="p-5 space-y-4">
        {price}

        {myTopBid && (
          <StandingBanner
            isTopBidder={isTopBidder}
            myBidAmount={Number(myTopBid.bidAmount)}
            justRaised={panel.placedBidAmount !== null && myBidCount > 1}
          />
        )}

        {panel.placedBidAmount != null && !myTopBid && <BidPlaced amount={panel.placedBidAmount} />}

        {!isTopBidder && (
          <QuickBidButton
            amount={panel.quickBidAmount}
            confirming={panel.confirming}
            submitting={panel.submitting === 'quick'}
            onPress={panel.pressQuickBid}
            onCancel={panel.cancelConfirm}
          />
        )}

        <AuctionItemBidPanelBidAmountForm
          label={isTopBidder ? 'Raise your bid' : 'Or enter your own amount'}
          value={panel.customAmount}
          onChange={panel.setCustomAmount}
          onSubmit={panel.pressCustomBid}
          submitting={panel.submitting === 'custom'}
          disabled={panel.submitting !== null}
          minimumBid={panel.minimumBid}
          currentBid={panel.currentBid}
          submitLabel={panel.placedBidAmount != null ? 'Bid again' : 'Place bid'}
          inputRef={panel.inputRef}
        />

        {panel.raceCondition && <RaceConditionNotice newMinimumBid={panel.raceCondition.newMinimumBid} onUse={panel.useRaceAmount} />}

        {panel.error && <BidError message={panel.error} />}
      </div>
    </div>
  )
}
