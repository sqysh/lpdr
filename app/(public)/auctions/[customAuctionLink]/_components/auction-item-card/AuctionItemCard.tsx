'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { AuctionStatus } from '@prisma/client'
import { PublicAuctionItem } from 'types/auction.types'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'
import { AuctionItemCardInfo } from './AuctionItemCardInfo'
import { AuctionItemCardPhoto } from './AuctionItemCardPhoto'
import { AuctionItemCardBadgeStrip } from './AuctionItemCardBadgeStrip'

export function AuctionItemCard({
  item,
  auctionStatus,
  index,
  customAuctionLink,
  myBid
}: {
  item: PublicAuctionItem
  auctionStatus: AuctionStatus
  index: number
  customAuctionLink: string
  myBid: MyBid
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const isEnded = auctionStatus === 'ENDED'
  const isUpcoming = auctionStatus === 'DRAFT'
  const isSold = item.status === 'SOLD'

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
        customAuctionLink={customAuctionLink}
        isSold={isSold}
        isUpcoming={isUpcoming}
        item={item}
        myBid={myBid}
      />
    </motion.article>
  )
}
