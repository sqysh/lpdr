import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AuctionStatus } from '@prisma/client'
import {
  serializeAuction,
  serializeAuctionBid,
  serializeAuctionItem,
  serializeInstantBuyer,
  serializeWinningBidder
} from 'lib/serializers'
import { getErrorMessage } from 'app/utils/_error.utils'

export default async function getAuctions({ status }: { status: AuctionStatus[] }) {
  try {
    const auctions = await prisma.auction.findMany({
      where: { status: { in: status } },
      include: {
        items: {
          include: { photos: true }
        },
        bids: {
          select: {
            id: true,
            bidAmount: true,
            auctionId: true,
            auctionItemId: true,
            userId: true,
            bidderId: true,
            status: true,
            sentWinnerEmail: true,
            emailCount: true,
            createdAt: true,
            updatedAt: true
          }
        },
        bidders: true,
        instantBuyers: true,
        winningBidders: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return auctions.map((a) => ({
      ...serializeAuction(a),
      items: a.items.map(serializeAuctionItem),
      bids: a.bids.map(serializeAuctionBid),
      winningBidders: a.winningBidders.map(serializeWinningBidder),
      instantBuyers: a.instantBuyers.map(serializeInstantBuyer)
    }))
  } catch (error) {
    await createLog('error', 'Failed to get auctions', {
      status,
      error: getErrorMessage(error)
    })
    return []
  }
}
