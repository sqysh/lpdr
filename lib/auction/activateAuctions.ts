import { revalidateTag } from 'next/cache'
import { Prisma } from '@prisma/client'
import prisma from 'prisma/client'
import { pusherTrigger } from 'lib/pusher/pusher.utils'

/** Everything the shared activation needs. Both callers select with this so the Pusher payload
 *  can't drift between the cron and the manual button. */
export const AUCTION_START_SELECT = {
  id: true,
  title: true,
  endDate: true,
  customAuctionLink: true,
  _count: { select: { items: true } }
} satisfies Prisma.AuctionSelect

export type StartableAuction = Prisma.AuctionGetPayload<{ select: typeof AUCTION_START_SELECT }>

/**
 * Flips auctions live and returns how many were started. Callers own their own auth, logging and
 * response shape; everything that has to happen identically either way lives here.
 */
export async function activateAuctions(auctions: StartableAuction[]) {
  if (auctions.length === 0) return 0

  const ids = auctions.map((a) => a.id)

  await prisma.$transaction([
    prisma.auction.updateMany({ where: { id: { in: ids } }, data: { status: 'ACTIVE', isPubliclyVisible: true } }),
    // not: 'SOLD' matters after a revert-to-draft, where instant buy items may already be sold.
    // Without it, restarting the auction would put those items back up for sale.
    prisma.auctionItem.updateMany({ where: { auctionId: { in: ids }, status: { not: 'SOLD' } }, data: { status: 'ACTIVE' } })
  ])

  revalidateTag('auction', 'max')

  const timestamp = new Date().toISOString()

  await Promise.all(
    auctions.map((auction) =>
      pusherTrigger(`auction-${auction.id}`, 'auction-started', {
        auctionId: auction.id,
        auctionTitle: auction.title,
        itemCount: auction._count.items,
        endDate: auction.endDate.toISOString(),
        customAuctionLink: auction.customAuctionLink,
        timestamp
      })
    )
  )

  return auctions.length
}
