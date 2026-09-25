'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getPusherClient, releaseChannel } from 'lib/pusher/pusher-client'

const channelFor = (auctionId: string) => `auction-${auctionId}`

/**
 * Holds the auction's channel for as long as someone is anywhere in this auction. The layout stays
 * mounted between the auction page and its items, so moving between them never drops the channel
 * and the socket never closes mid-navigation.
 */
export function AuctionChannel({ auctionId, children }: { auctionId: string; children: React.ReactNode }) {
  const router = useRouter()
  const routerRef = useRef(router)

  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    const name = channelFor(auctionId)
    const channel = getPusherClient().subscribe(name)
    // Opening and closing change every page in the auction, so the layout handles them for all of them
    const onStatusChanged = () => routerRef.current.refresh()

    channel.bind('auction-started', onStatusChanged)
    channel.bind('auction-ended', onStatusChanged)

    return () => {
      channel.unbind('auction-started', onStatusChanged)
      channel.unbind('auction-ended', onStatusChanged)
      releaseChannel(name)
    }
  }, [auctionId])

  return children
}

/**
 * For a page inside the auction to listen to one of its events. It only binds a handler: the layout
 * owns the subscription, so leaving a page never releases the channel.
 */
export function useAuctionChannelEvent<T>(auctionId: string, event: string, handler: (data: T) => void) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    // Subscribing is idempotent in pusher-js, so this returns the layout's channel. It's called here
    // too because a page's effects run before its layout's on first load
    const channel = getPusherClient().subscribe(channelFor(auctionId))
    const listener = (data: T) => handlerRef.current(data)

    channel.bind(event, listener)
    return () => {
      channel.unbind(event, listener)
    }
  }, [auctionId, event])
}
