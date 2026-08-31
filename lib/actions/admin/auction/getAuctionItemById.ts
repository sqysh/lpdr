import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'

const AUCTION_ITEM_INCLUDE = {
  photos: {
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }]
  },
  bids: {
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, anonymousBidding: true }
      },
      bidder: { select: { id: true } }
    }
  },
  winningBidder: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  },
  instantBuyers: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  },
  auction: {
    select: { id: true, title: true, status: true, startDate: true, endDate: true, customAuctionLink: true }
  }
} satisfies Parameters<typeof prisma.auctionItem.findUnique>[0]['include']

async function fetchAuctionItem(id: string) {
  return prisma.auctionItem.findUnique({
    where: { id },
    include: AUCTION_ITEM_INCLUDE
  })
}

type RawItem = NonNullable<Awaited<ReturnType<typeof fetchAuctionItem>>>

function serializeAuctionItem(item: RawItem) {
  const toNum = (v: unknown) => (v != null ? Number(v) : null)

  return {
    ...item,
    startingPrice: toNum(item.startingPrice),
    buyNowPrice: toNum(item.buyNowPrice),
    currentPrice: toNum(item.currentPrice),
    currentBid: toNum(item.currentBid),
    minimumBid: toNum(item.minimumBid),
    soldPrice: toNum(item.soldPrice),
    shippingCosts: toNum(item.shippingCosts),
    bids: item.bids.map((bid) => ({ ...bid, bidAmount: Number(bid.bidAmount) })),
    winningBidder: item.winningBidder
      ? {
          ...item.winningBidder,
          processingFee: toNum(item.winningBidder.processingFee),
          totalPrice: toNum(item.winningBidder.totalPrice),
          itemSoldPrice: toNum(item.winningBidder.itemSoldPrice),
          shipping: toNum(item.winningBidder.shipping)
        }
      : null,
    instantBuyers: item.instantBuyers.map((ib) => ({ ...ib, totalPrice: toNum(ib.totalPrice) }))
  }
}

export const getAuctionItemById = async (id: string) => {
  try {
    const item = await fetchAuctionItem(id)

    if (!item) return { success: false, error: 'Auction item not found', data: null }

    return { success: true, auctionItem: serializeAuctionItem(item) }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction item', {
      id,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to fetch auction item', data: null }
  }
}
