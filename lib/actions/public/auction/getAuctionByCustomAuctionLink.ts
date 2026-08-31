import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { auctionItemLiveIncludes } from 'types/_auction-item'
import {
  serializeAuction,
  serializeAuctionBid,
  serializeAuctionItem,
  serializeInstantBuyer,
  serializeWinningBidder
} from 'lib/serializers'

export const getAuctionByCustomAuctionLink = async (link: string) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { customAuctionLink: link },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
          ...auctionItemLiveIncludes
        },
        bidders: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                anonymousBidding: true
              }
            }
          }
        },
        bids: { orderBy: { createdAt: 'desc' } },
        winningBidders: { include: { user: true, auctionItems: true } },
        instantBuyers: true
      }
    })

    if (!auction) return { success: false, data: null }

    return {
      success: true,
      data: {
        ...serializeAuction(auction),
        items: auction.items.map(serializeAuctionItem),
        bids: auction.bids.map(serializeAuctionBid),
        winningBidders: auction.winningBidders.map(serializeWinningBidder),
        instantBuyers: auction.instantBuyers.map(serializeInstantBuyer)
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction by custom link', {
      link,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { success: false, data: null }
  }
}
