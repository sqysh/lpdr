import { useSounds } from 'lib/hooks/useSounds.hook'
import { placeBid } from 'lib/actions/user/auction/placeBid'
import { useInView, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { PublicAuctionItem } from 'types/auction.types'
import { AuctionStatus } from '@prisma/client'
import { useConfettiStore } from 'stores/confetti.store'
import { AuctionItemCardInfo } from './AuctionItemCardInfo'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'
import { AuctionItemCardPhoto } from './AuctionItemCardPhoto'
import { AuctionItemCardBadgeStrip } from './AuctionItemCardBadgeStrip'
import { useAuctionUiStore } from 'stores/auction-ui.store'

type Props = {
  item: PublicAuctionItem
  auctionStatus: AuctionStatus
  index: number
  customAuctionLink: string
  onBidSuccess?: () => void
  myBid: MyBid
  isAuthed: boolean
}

export function AuctionItemCard({ item, auctionStatus, index, customAuctionLink, onBidSuccess, myBid, isAuthed }: Props) {
  const router = useRouter()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [quickBidLoading, setQuickBidLoading] = useState(false)
  const [quickBidError, setQuickBidError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const { play } = useSounds()
  const showConfetti = useConfettiStore((s) => s.show)
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)

  const quickBidAmount = Number(item.currentBid ?? item.startingPrice ?? 0) + 10

  const isEnded = auctionStatus === 'ENDED'
  const isUpcoming = auctionStatus === 'DRAFT'
  const isSold = item.status === 'SOLD'

  const handleQuickBid = async () => {
    if (!isAuthed) {
      openSignInModal(`/auctions/${customAuctionLink}/${item.id}?bidModal=true`)
      return
    }

    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 7000)
      return
    }

    setConfirming(false)
    setQuickBidLoading(true)
    setQuickBidError(null)

    const result = await placeBid(item.id, quickBidAmount)

    setQuickBidLoading(false)

    if (result.success) {
      play('se2')
      onBidSuccess?.()
      showConfetti()
      router.refresh()
    } else {
      setQuickBidError(
        result.error === 'LOCK_NOT_ACQUIRED'
          ? `Bid updated to $${result.data?.newMinimumBid ?? quickBidAmount}. Try again.`
          : (result.error ?? 'Something went wrong.')
      )
    }
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      aria-label={item.name}
      className="group relative bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark overflow-hidden flex flex-col h-full"
    >
      {/* Badge strip */}
      <AuctionItemCardBadgeStrip isEnded={isEnded} isSold={isSold} isUpcoming={isUpcoming} item={item} />
      {/* Photo */}
      <AuctionItemCardPhoto isEnded={isEnded} isSold={isSold} item={item} />
      {/* Info */}
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
