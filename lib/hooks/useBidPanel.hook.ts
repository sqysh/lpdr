'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { placeBid } from 'lib/actions/user/auction/placeBid'
import { formatMoney } from 'lib/utils/currency.utils'
import { useSounds } from 'lib/hooks/useSounds.hook'
import { useConfettiStore } from 'stores/confetti.store'
import { PublicAuctionItem } from 'types/auction.types'
import { QUICK_BID_INCREMENT } from 'lib/constants/auction.constants'
import { getPusherClient, releaseChannel } from 'lib/pusher/pusher-client'

const CONFIRM_WINDOW_MS = 5000

type RaceCondition = { newMinimumBid: number; currentBid: number | null }

type BidPlacedPayload = { currentBid?: number; minimumBid?: number; totalBids?: number }

export function useBidPanel(item: PublicAuctionItem) {
  const router = useRouter()
  const { play } = useSounds()
  const showConfetti = useConfettiStore((s) => s.show)

  // Only what Pusher has told us lives in state. The displayed figures are derived below, so
  // there is no effect syncing props into state and no cascading render.
  const [live, setLive] = useState<BidPlacedPayload | null>(null)

  const [customAmount, setCustomAmount] = useState('')
  const [submitting, setSubmitting] = useState<'quick' | 'custom' | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [raceCondition, setRaceCondition] = useState<RaceCondition | null>(null)
  const [placedBidAmount, setPlacedBidAmount] = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const confirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlight = useRef(false)

  // Auction figures only ever climb, so the highest of the two sources is the current truth.
  // That makes a refresh and a Pusher event self-reconciling whichever order they arrive in.
  const currentBid = Math.max(Number(item?.currentBid ?? item?.startingPrice ?? 0), Number(live?.currentBid ?? 0))
  const minimumBid = Math.max(Number(item?.minimumBid ?? item?.startingPrice ?? 0), Number(live?.minimumBid ?? 0))
  const bidCount = Math.max(item?.bids?.length ?? 0, Number(live?.totalBids ?? 0))

  const quickBidAmount = currentBid + QUICK_BID_INCREMENT

  useEffect(() => {
    return () => {
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
    }
  }, [])

  useEffect(() => {
    if (!item?.id) return

    const channelName = `auction-item-${item.id}`
    const pusher = getPusherClient()
    const channel = pusher.subscribe(channelName)

    const onBidPlaced = (data: { auctionItem?: BidPlacedPayload; item?: BidPlacedPayload }) => {
      const payload = data?.auctionItem ?? data?.item
      if (!payload) return

      setLive(payload)
    }

    channel.bind('bid-placed', onBidPlaced)

    return () => {
      channel.unbind('bid-placed', onBidPlaced)
      releaseChannel(channelName)
    }
  }, [item?.id])

  const cancelConfirm = () => {
    if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
    setConfirming(false)
  }

  /** One submit path for both buttons, so the two can't drift on error handling. */
  const submit = async (amount: number, kind: 'quick' | 'custom') => {
    // A ref, not the submitting state: a fast double tap can land both taps before the re-render disables the button
    if (inFlight.current) return
    inFlight.current = true

    setError(null)
    setRaceCondition(null)
    setSubmitting(kind)

    try {
      const result = await placeBid(item.id, amount)

      if (!result.success) {
        if (result.error === 'LOCK_NOT_ACQUIRED' && result.data?.newMinimumBid) {
          setRaceCondition({ newMinimumBid: result.data.newMinimumBid, currentBid: result.data.currentBid })
          return
        }
        setError(result.error ?? 'Unable to place bid. Please try again.')
        return
      }

      play('se1')
      showConfetti()
      setPlacedBidAmount(amount)
      setCustomAmount('')
      router.refresh()
    } finally {
      inFlight.current = false
      setSubmitting(null)
    }
  }

  /** First press arms, second places. Quick bid has no amount to review before it commits. */
  const pressQuickBid = () => {
    if (!confirming) {
      setError(null)
      setRaceCondition(null)
      setConfirming(true)
      confirmTimeout.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS)
      return
    }

    cancelConfirm()
    submit(quickBidAmount, 'quick')
  }

  const pressCustomBid = () => {
    const amount = Number(customAmount)

    if (!customAmount.trim() || Number.isNaN(amount)) {
      setError('Please enter a valid bid amount.')
      return
    }

    if (amount < minimumBid) {
      setError(`The minimum bid is ${formatMoney(minimumBid)}.`)
      return
    }

    submit(amount, 'custom')
  }

  const useRaceAmount = () => {
    if (!raceCondition) return
    setCustomAmount(String(raceCondition.newMinimumBid))
    setRaceCondition(null)
    inputRef.current?.focus()
  }

  return {
    currentBid,
    minimumBid,
    bidCount,
    quickBidAmount,
    customAmount,
    setCustomAmount,
    submitting,
    confirming,
    cancelConfirm,
    error,
    raceCondition,
    useRaceAmount,
    placedBidAmount,
    inputRef,
    pressQuickBid,
    pressCustomBid
  }
}
