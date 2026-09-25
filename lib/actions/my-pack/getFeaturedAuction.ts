import { auth } from 'lib/auth'
import { getNavAuction } from '../public/auction/getNavAuction'
import prisma from 'prisma/client'

/**
 * A live auction, or an upcoming one the crew has made public. A pack member is already engaged
 * enough that telling them an auction opens on the 26th is worth as much as telling them it is
 * open now, so the banner covers both and says which.
 */
export async function getFeaturedAuction() {
  const auction = await getNavAuction()
  if (!auction) return null

  const isLive = auction.status === 'ACTIVE'
  const isUpcoming = auction.status === 'DRAFT' && auction.isPubliclyVisible

  if (!isLive && !isUpcoming) return null

  const session = await auth()
  const userId = session?.user?.id

  const [itemCount, myBid] = await Promise.all([
    prisma.auctionItem.count({ where: { auctionId: auction.id } }),
    // Only a live auction can have bids, so the lookup is skipped on an upcoming one.
    isLive && userId
      ? prisma.auctionBid.findFirst({ where: { auctionId: auction.id, userId }, select: { id: true } })
      : Promise.resolve(null)
  ])

  return { ...auction, itemCount, isLive, hasBids: !!myBid }
}
