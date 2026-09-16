'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuctionEndedData, AuctionStartedData } from 'types/auction-event.types'
import { pusherClient } from 'lib/pusher/pusher-client'
import { AuctionStartedModal } from './AuctionStartedModal'
import { AuctionEndedModal } from './AuctionEndedModal'
import { AuctionStatus } from '@prisma/client'
import AuctionAnnouncementStrip from './header/AuctionAnnouncementStrip'

const RANK: Record<AuctionStatus, number> = { DRAFT: 0, ACTIVE: 1, ENDED: 2 }

/** Where the strip would be noise: the auction pages say it themselves, and the other two are
 *  not places anyone needs telling. */
const HIDE_STRIP_ON = ['/auctions', '/order-confirmation', '/super', '/admin']

export const AuctionRealtimeClient = ({
  auction
}: {
  auction: {
    id: string
    title: string
    status: AuctionStatus
    startDate: Date | null
    endDate: Date | null
    customAuctionLink: string
    isPubliclyVisible: boolean
  }
}) => {
  const router = useRouter()
  const routerRef = useRef(router)
  const pathname = usePathname()

  const [startedData, setStartedData] = useState<AuctionStartedData | null>(null)
  const [endedData, setEndedData] = useState<AuctionEndedData | null>(null)

  // What the events have told us since load. The displayed auction is derived below, so a
  // refresh bringing fresh props and an event arriving cannot fight over one piece of state.
  const [liveStatus, setLiveStatus] = useState<AuctionStatus | null>(null)

  const status = liveStatus && RANK[liveStatus] > RANK[auction.status] ? liveStatus : auction.status
  const current = { ...auction, status }

  // This component sits in the root layout, so every visitor on every page holds this
  // subscription for as long as they browse. An ended auction emits nothing, so it does not
  // need one.
  const isOver = status === 'ENDED'

  // Announce a live auction to everyone, and an upcoming one only once the crew has made it
  // public. An ended auction has nothing left to announce.
  const showStrip =
    (status === 'ACTIVE' || (status === 'DRAFT' && auction.isPubliclyVisible)) && !HIDE_STRIP_ON.some((path) => pathname.startsWith(path))

  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    if (isOver) return

    const channelName = `auction-${auction.id}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind('auction-started', (data: AuctionStartedData) => {
      setLiveStatus('ACTIVE')
      routerRef.current.refresh()
      setStartedData(data)
    })

    channel.bind('auction-ended', (data: AuctionEndedData) => {
      setLiveStatus('ENDED')
      routerRef.current.refresh()
      setEndedData(data)
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(channelName)
    }
  }, [auction.id, isOver])

  return (
    <>
      {showStrip && <AuctionAnnouncementStrip auction={current} />}
      <AuctionStartedModal data={startedData} onClose={() => setStartedData(null)} />
      <AuctionEndedModal data={endedData} onClose={() => setEndedData(null)} />
    </>
  )
}
