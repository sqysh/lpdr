'use client'

import { useEffect, useRef, useState } from 'react'
import { pusherClient } from 'lib/pusher/pusher-client'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PublicAuction } from 'types/auction.types'
import { AuctionCountdown, AuctionEmptyState, AuctionHowItWorks, AuctionItemGrid, AuctionSignInModal, AuctionSoldGrid } from './_components'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'

export default function PublicAuctionClient({ auction, myBids }: { auction: PublicAuction; myBids: Record<string, MyBid> }) {
  const session = useSession()
  const router = useRouter()
  const routerRef = useRef(router)
  const [filter, setFilter] = useState<'ALL' | 'AUCTION' | 'FIXED' | 'NO BIDS'>('ALL')
  const [slotTrigger, setSlotTrigger] = useState(0)

  const isAuthed = session.status === 'authenticated'
  const role = session.data?.user?.role
  const isDraft = auction.status === 'DRAFT'
  const isActive = auction.status === 'ACTIVE'
  const isEnded = auction.status === 'ENDED'

  const available = auction.items.filter((i) => i.status !== 'SOLD')
  const sold = auction.items.filter((i) => i.status === 'SOLD')

  const filtered = available.filter((item) => {
    if (filter === 'ALL') return true
    if (filter === 'NO BIDS') return item._count?.bids === 0 && item.sellingFormat !== 'FIXED'
    return item.sellingFormat === filter
  })

  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    if (!auction.id) return

    const channelName = `auction-${auction.id}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind('bid-placed', () => {
      routerRef.current.refresh()
      setSlotTrigger((t) => t + 1)
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(channelName)
    }
  }, [auction.id])

  return (
    <>
      <AuctionSignInModal />

      <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
        <AuctionCountdown
          auction={auction}
          isActive={isActive}
          isEnded={isEnded}
          trigger={slotTrigger}
          isAuthed={isAuthed}
          isDraft={isDraft}
          role={role}
        />

        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 py-10 sm:py-14">
          <AuctionItemGrid
            auction={auction}
            available={filtered}
            customAuctionLink={auction.customAuctionLink}
            isActive={isActive}
            setFilter={setFilter}
            filter={filter}
            setSlotTrigger={setSlotTrigger}
            myBids={myBids}
            isAuthed={isAuthed}
          />
          <AuctionSoldGrid
            auction={auction}
            customAuctionLink={auction.customAuctionLink}
            sold={sold}
            myBids={myBids}
            isAuthed={isAuthed}
          />
          <AuctionEmptyState auction={auction} />
          <AuctionHowItWorks isActive={isActive} />
        </div>
      </main>
    </>
  )
}
