import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'

const AUCTION_INCLUDE = {
  items: {
    orderBy: { createdAt: 'asc' },
    include: { photos: true }
  },
  bidders: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, anonymousBidding: true }
      }
    }
  },
  bids: { orderBy: { createdAt: 'desc' } },
  winningBidders: { include: { auctionItems: true, user: true } },
  instantBuyers: true
} satisfies Parameters<typeof prisma.auction.findUnique>[0]['include']

async function fetchAuction(id: string) {
  return prisma.auction.findUnique({
    where: { id },
    include: AUCTION_INCLUDE
  })
}

type RawAuction = NonNullable<Awaited<ReturnType<typeof fetchAuction>>>

const toNum = (v: unknown) => (v != null ? Number(v) : null)

function serializeAuctionItem(item: RawAuction['items'][number]) {
  return {
    ...item,
    retailValue: toNum(item.retailValue),
    startingPrice: toNum(item.startingPrice),
    buyNowPrice: toNum(item.buyNowPrice),
    currentPrice: toNum(item.currentPrice),
    currentBid: toNum(item.currentBid),
    minimumBid: toNum(item.minimumBid),
    soldPrice: toNum(item.soldPrice),
    shippingCosts: toNum(item.shippingCosts)
  }
}

function serializeBids(bids: RawAuction['bids']) {
  return bids.map((bid) => ({ ...bid, bidAmount: Number(bid.bidAmount) }))
}

function serializeWinningBidders(winningBidders: RawAuction['winningBidders']) {
  return winningBidders.map((wb) => ({
    ...wb,
    processingFee: toNum(wb.processingFee),
    totalPrice: toNum(wb.totalPrice),
    itemSoldPrice: toNum(wb.itemSoldPrice),
    shipping: toNum(wb.shipping),
    auctionItems: wb.auctionItems.map(serializeAuctionItem)
  }))
}

function serializeInstantBuyers(instantBuyers: RawAuction['instantBuyers']) {
  return instantBuyers.map((buyer) => ({ ...buyer, totalPrice: toNum(buyer.totalPrice) }))
}

function serializeAuction(auction: RawAuction) {
  return {
    ...auction,
    goal: Number(auction.goal),
    totalAuctionRevenue: Number(auction.totalAuctionRevenue),
    items: auction.items.map(serializeAuctionItem),
    bids: serializeBids(auction.bids),
    winningBidders: serializeWinningBidders(auction.winningBidders),
    instantBuyers: serializeInstantBuyers(auction.instantBuyers)
  }
}

export const getAuctionById = async (id: string) => {
  try {
    const auction = await fetchAuction(id)

    if (!auction) return { success: false, error: 'Auction not found', data: null }

    return { success: true, data: serializeAuction(auction) }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction', {
      id,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to fetch auction', data: null }
  }
}
