'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PublicAuction } from 'types/auction.types'
import { AuctionCountdown, AuctionEmptyState, AuctionHowItWorks, AuctionItemGrid, AuctionSignInModal, AuctionSoldGrid } from './_components'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'
import { AUCTION_FILTERS, AuctionFilter, matchesFilter } from './_lib/auction-filters'
import { useAuctionChannelEvent } from './_components/AuctionChannel'

export default function PublicAuctionClient({ auction, myBids }: { auction: PublicAuction; myBids: Record<string, MyBid> }) {
  const session = useSession()
  const router = useRouter()
  const [filter, setFilter] = useState<AuctionFilter>('ALL')

  const isAuthed = session.status === 'authenticated'
  const role = session.data?.user?.role
  const isDraft = auction.status === 'DRAFT'
  const isActive = auction.status === 'ACTIVE'
  const isEnded = auction.status === 'ENDED'

  const available = auction.items.filter((i) => i.status !== 'SOLD')
  const sold = auction.items.filter((i) => i.status === 'SOLD')

  const filtered = available.filter((item) => matchesFilter(item, filter, myBids))
  const counts = Object.fromEntries(
    AUCTION_FILTERS.map((f) => [f, available.filter((item) => matchesFilter(item, f, myBids)).length])
  ) as Record<AuctionFilter, number>

  const pendingRefresh = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Bids arrive in bursts near the end, and each refresh re-renders the whole auction on the server.
  // Waiting a moment folds a burst into one refresh per viewer instead of one per bid
  useAuctionChannelEvent(auction.id, 'bid-placed', () => {
    if (pendingRefresh.current) return
    pendingRefresh.current = setTimeout(() => {
      pendingRefresh.current = null
      router.refresh()
    }, 1500)
  })

  useEffect(() => {
    return () => {
      if (pendingRefresh.current) clearTimeout(pendingRefresh.current)
    }
  }, [])

  return (
    <>
      <AuctionSignInModal />

      <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <AuctionCountdown auction={auction} isActive={isActive} isEnded={isEnded} isAuthed={isAuthed} isDraft={isDraft} role={role} />

        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 py-10 sm:py-14">
          <AuctionItemGrid
            auction={auction}
            available={filtered}
            customAuctionLink={auction.customAuctionLink}
            isActive={isActive}
            setFilter={setFilter}
            filter={filter}
            myBids={myBids}
            isAuthed={isAuthed}
            counts={counts}
          />
          <AuctionSoldGrid
            auction={auction}
            customAuctionLink={auction.customAuctionLink}
            sold={sold}
            myBids={myBids}
            isAuthed={isAuthed}
          />
          <AuctionEmptyState auction={auction} />
          <AuctionHowItWorks isEnded={isEnded} />
        </div>
      </main>
    </>
  )
}
