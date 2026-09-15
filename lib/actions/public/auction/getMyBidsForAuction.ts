import { auth } from 'lib/auth'
import prisma from 'prisma/client'

export type MyBid = {
  auctionItemId?: string
  status: string
  bidAmount: number
}

export const getMyBidsForAuction = async (auctionId: string): Promise<Record<string, MyBid>> => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return {}

  const bids = await prisma.auctionBid.findMany({
    where: { auctionId, userId },
    orderBy: { bidAmount: 'desc' },
    select: { auctionItemId: true, status: true, bidAmount: true }
  })

  // Highest bid per item wins the badge: it is the one that is either TOP_BID or was beaten.
  return bids.reduce<Record<string, MyBid>>((acc, bid) => {
    if (!acc[bid.auctionItemId]) acc[bid.auctionItemId] = { status: bid.status, bidAmount: Number(bid.bidAmount) }
    return acc
  }, {})
}
