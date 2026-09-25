'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useInView } from 'framer-motion'
import { AuctionStatus } from '@prisma/client'
import { useSounds } from 'lib/hooks/useSounds.hook'
import { placeBid } from 'lib/actions/user/auction/placeBid'
import { formatMoney } from 'lib/utils/currency.utils'
import { QUICK_BID_INCREMENT } from 'lib/constants/auction.constants'
import { PublicAuctionItem } from 'types/auction.types'
import { useConfettiStore } from 'stores/confetti.store'
import { useAuctionUiStore } from 'stores/auction-ui.store'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'
import { AuctionItemCardInfo } from './AuctionItemCardInfo'
import { AuctionItemCardPhoto } from './AuctionItemCardPhoto'
import { AuctionItemCardBadgeStrip } from './AuctionItemCardBadgeStrip'

// Matches the item page's quick bid, so arming on either feels the same
const CONFIRM_WINDOW_MS = 5000

type Props = {
  item: PublicAuctionItem
  auctionStatus: AuctionStatus
  index: number
  customAuctionLink: string
  myBid: MyBid
  isAuthed: boolean
}

export function AuctionItemCard({ item, auctionStatus, index, customAuctionLink, myBid, isAuthed }: Props) {
  const router = useRouter()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const { play } = useSounds()
  const showConfetti = useConfettiStore((s) => s.show)
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)

  const [quickBidLoading, setQuickBidLoading] = useState(false)
  const [quickBidError, setQuickBidError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const confirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inFlight = useRef(false)

  const quickBidAmount = Number(item.currentBid ?? item.startingPrice ?? 0) + QUICK_BID_INCREMENT

  const isEnded = auctionStatus === 'ENDED'
  const isUpcoming = auctionStatus === 'DRAFT'
  const isSold = item.status === 'SOLD'

  useEffect(() => {
    return () => {
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
    }
  }, [])

  const handleQuickBid = async () => {
    if (!isAuthed) {
      openSignInModal(`/auctions/${customAuctionLink}/${item.id}?bidModal=true`)
      return
    }

    // A ref, not the loading state: a fast double tap can land both taps before the re-render disables the button
    if (inFlight.current) return

    if (!confirming) {
      setQuickBidError(null)
      setConfirming(true)
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
      confirmTimeout.current = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS)
      return
    }

    if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
    setConfirming(false)

    inFlight.current = true
    setQuickBidLoading(true)
    setQuickBidError(null)

    try {
      const result = await placeBid(item.id, quickBidAmount)

      if (!result.success) {
        setQuickBidError(
          result.error === 'LOCK_NOT_ACQUIRED'
            ? `Someone just bid. The next bid is now ${formatMoney(Number(result.data?.newMinimumBid ?? quickBidAmount))}. Try again.`
            : (result.error ?? 'Something went wrong.')
        )
        return
      }

      play('se2')
      showConfetti()
      router.refresh()
    } finally {
      inFlight.current = false
      setQuickBidLoading(false)
    }
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      aria-label={item.name}
      className="group relative bg-bg-light dark:bg-bg-dark overflow-hidden flex flex-col h-full"
    >
      <AuctionItemCardBadgeStrip isSold={isSold} item={item} />
      <AuctionItemCardPhoto isEnded={isEnded} isSold={isSold} item={item} index={index} />
      <AuctionItemCardInfo
        auctionStatus={auctionStatus}
        confirming={confirming}
        customAuctionLink={customAuctionLink}
        handleQuickBid={handleQuickBid}
        isSold={isSold}
        isUpcoming={isUpcoming}
        item={item}
        quickBidAmount={quickBidAmount}
        quickBidError={quickBidError}
        quickBidLoading={quickBidLoading}
        myBid={myBid}
      />
    </motion.article>
  )
}
