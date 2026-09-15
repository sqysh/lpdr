'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatMoney } from 'lib/utils/currency.utils'
import { placeBid } from 'lib/actions/user/auction/placeBid'
import { QUICK_BID_INCREMENT } from 'lib/constants/auction.constants'

/**
 * Two-step quick bid, shared by every surface that offers it. A bid is binding and quick bid is
 * the one path with no review step, so the first press arms and the second places.
 */
export function useQuickBid(item: { id: string; currentBid?: number | null; startingPrice?: number | null }) {
  const router = useRouter()

  const [confirming, setConfirming] = useState(false)
  const [bidding, setBidding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const confirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const amount = Number(item.currentBid ?? item.startingPrice ?? 0) + QUICK_BID_INCREMENT

  useEffect(() => {
    return () => {
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
    }
  }, [])

  const cancel = () => {
    if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
    setConfirming(false)
  }

  const press = async () => {
    if (!confirming) {
      setError(null)
      setConfirming(true)
      confirmTimeout.current = setTimeout(() => setConfirming(false), 5000)
      return
    }

    cancel()
    setError(null)
    setBidding(true)

    const result = await placeBid(item.id, amount)

    setBidding(false)

    if (!result.success) {
      setError(
        result.error === 'LOCK_NOT_ACQUIRED'
          ? `Someone bid first. The minimum is now ${formatMoney(result.data?.newMinimumBid ?? amount)}.`
          : (result.error ?? 'Unable to place bid. Please try again.')
      )
      return
    }

    router.refresh()
  }

  return { amount, confirming, bidding, error, press, cancel }
}
