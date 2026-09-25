'use client'

import { useEffect } from 'react'
import { Gavel } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useAuctionUiStore } from 'stores/auction-ui.store'
import { Reveal } from 'components/_common/Reveal'
import { AuctionSignInModal } from '../_components'
import { PublicAuctionItem } from 'types/auction.types'
import { AuctionItemCountdown } from './_components/AuctionItemCountdown'
import { AuctionItemBidPanel } from './_components/auction-item-bid-panel/AuctionItemBidPanel'
import {
  AuctionItemBidHistory,
  AuctionItemFixedFooterNav,
  AuctionItemItemDetails,
  AuctionItemPhotoGallery,
  AuctionItemStickyBar,
  AuctionItemTitleBlock
} from './_components'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSignOut.hook'
import { AuctionSignedInAs } from './_components/AuctionSignedInAs'

type Props = {
  item: PublicAuctionItem
  auctionItems: PublicAuctionItem['auction']['items']
  isAuthed: boolean
  currentUserId: string | null
}

export default function PublicAuctionItemClient({ item, auctionItems, isAuthed, currentUserId }: Props) {
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)
  const searchParams = useSearchParams()

  useRefreshOnSignOut(isAuthed)

  const isDraft = item?.auction?.status === 'DRAFT'
  const isActive = item?.auction?.status === 'ACTIVE'
  const isEnded = item?.auction?.status === 'ENDED'
  const isSold = item?.status === 'SOLD'
  const isFixed = item?.sellingFormat === 'FIXED'
  const customAuctionLink = item?.auction?.customAuctionLink

  const topBid = item.bids.find((b) => b.status === 'TOP_BID')
  const myTopBid = currentUserId
    ? (item.bids.filter((b) => b.userId === currentUserId).sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount))[0] ?? null)
    : null
  const isTopBidder = !!myTopBid && topBid?.id === myTopBid.id

  // The bid panel is inline, so an authed arrival needs nothing doing. Only the signed-out case
  // still has somewhere to send them
  useEffect(() => {
    if (searchParams.get('bidModal') !== 'true' || isAuthed) return
    openSignInModal(`/auctions/${customAuctionLink}/${item.id}?bidModal=true`)
  }, [customAuctionLink, item.id, searchParams, isAuthed, openSignInModal])

  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <AuctionSignInModal />

      <AuctionItemStickyBar customAuctionLink={customAuctionLink} isActive={isActive} isEnded={isEnded} item={item} isDraft={isDraft} />

      {/* Bottom padding clears the fixed footer bar, including the iPhone home indicator it now sits above */}
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 pt-8 pb-28 sm:pb-32 sm:pt-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          <Reveal>
            <AuctionItemPhotoGallery photos={item?.photos} name={item?.name} />
          </Reveal>

          <div className="space-y-5">
            <Reveal index={1}>
              <AuctionItemTitleBlock isActive={isActive} isFixed={isFixed} isSold={isSold} item={item} />
            </Reveal>

            <Reveal index={2}>
              <div className="space-y-2">
                {isAuthed && <AuctionSignedInAs />}
                <AuctionItemBidPanel
                  item={item}
                  isAuthed={isAuthed}
                  isTopBidder={isTopBidder}
                  customAuctionLink={customAuctionLink}
                  topBid={topBid}
                  myTopBid={myTopBid}
                  currentUserId={currentUserId}
                />
              </div>
            </Reveal>

            {(isActive || isDraft) && (
              <Reveal index={3}>
                <AuctionItemCountdown date={isDraft ? item.auction.startDate : item.auction.endDate} opens={isDraft} />
              </Reveal>
            )}

            <Reveal index={4}>
              <AuctionItemItemDetails isFixed={isFixed} item={item} />
            </Reveal>
          </div>
        </div>

        {item?.bids.length > 0 && (
          <Reveal className="mt-12">
            <AuctionItemBidHistory topBid={topBid} bids={item.bids} />
          </Reveal>
        )}

        {item?.bids.length === 0 && !isFixed && (
          <Reveal className="mt-12">
            <div className="border border-border-light dark:border-border-dark py-16 flex flex-col items-center gap-4 text-center px-6">
              <div
                className="relative w-12 h-12 border border-border-light dark:border-border-dark flex items-center justify-center"
                aria-hidden="true"
              >
                <Gavel size={18} className="text-muted-light dark:text-muted-dark" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-light dark:bg-primary-dark" />
              </div>
              <div>
                <p className="font-quicksand font-black text-base text-text-light dark:text-text-dark mb-1">No bids yet</p>
                {/* "Be the first" only while bidding is open; before and after, it would invite something that can't happen */}
                <p className="text-sm font-mono text-muted-light dark:text-muted-dark">
                  {isActive
                    ? 'Be the first to place a bid on this item.'
                    : isDraft
                      ? 'Bidding opens when the auction starts.'
                      : 'No bids were placed on this item.'}
                </p>
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <AuctionItemFixedFooterNav
        auctionItems={auctionItems}
        customAuctionLink={customAuctionLink}
        isAuthed={isAuthed}
        isFixed={isFixed}
        item={item}
        isTopBidder={isTopBidder}
      />
    </main>
  )
}
