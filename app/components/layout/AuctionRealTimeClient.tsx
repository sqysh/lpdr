// app/_components/AuctionRealtimeClient.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuctionEndedData, AuctionStartedData } from 'types/_auction'
import { pusherClient } from 'lib/pusher/pusher-client'
import { AuctionEndedModal, AuctionStartedModal } from '../features/auction'

export const AuctionRealtimeClient = ({ auctionId }: { auctionId: string }) => {
  const router = useRouter()
  const routerRef = useRef(router)

  const [startedData, setStartedData] = useState<AuctionStartedData | null>(null)
  const [endedData, setEndedData] = useState<AuctionEndedData | null>(null)

  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    const channelName = `auction-${auctionId}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind('auction-started', (data: AuctionStartedData) => {
      routerRef.current.refresh()
      setStartedData(data)
    })
    channel.bind('auction-ended', (data: AuctionEndedData) => {
      routerRef.current.refresh()
      setEndedData(data)
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(channelName)
    }
  }, [auctionId])

  return (
    <>
      <AuctionStartedModal data={startedData} onClose={() => setStartedData(null)} />
      <AuctionEndedModal data={endedData} onClose={() => setEndedData(null)} />
    </>
  )
}
