'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PublicAuction } from 'types/auction.types'
import { AuctionCountdown, AuctionEmptyState, AuctionHowItWorks, AuctionItemGrid, AuctionSignInModal, AuctionSoldGrid } from './_components'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'
import { useAuctionChannelEvent } from './_components/AuctionChannel'
import { AutoPayPrompt, AutoPayStatus } from './_components/AutoPayPrompt'
import { Role } from '@prisma/client'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSignOut.hook'

export default function PublicAuctionClient({
  auction,
  myBids,
  autoPay,
  isAuthed,
  role
}: {
  auction: PublicAuction
  myBids: Record<string, MyBid>
  autoPay: AutoPayStatus | null
  isAuthed: boolean
  role: Role | null
}) {
  const router = useRouter()

  useRefreshOnSignOut(isAuthed)

  const isDraft = auction.status === 'DRAFT'
  const isActive = auction.status === 'ACTIVE'
  const isEnded = auction.status === 'ENDED'

  const available = auction.items.filter((i) => i.status !== 'SOLD')
  const sold = auction.items.filter((i) => i.status === 'SOLD')

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
          <AutoPayPrompt autoPay={autoPay} isEnded={isEnded} />
          <AuctionItemGrid
            auction={auction}
            available={available}
            customAuctionLink={auction.customAuctionLink}
            isActive={isActive}
            myBids={myBids}
          />
          <AuctionSoldGrid auction={auction} customAuctionLink={auction.customAuctionLink} sold={sold} myBids={myBids} />
          <AuctionEmptyState auction={auction} />
          <AuctionHowItWorks isEnded={isEnded} />
        </div>
      </main>
    </>
  )
}
