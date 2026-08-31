'use server'

import prisma from 'prisma/client'

export const getActiveAuctionItems = async (auctionId: string) => {
  const items = await prisma.auctionItem.findMany({
    where: {
      auctionId,
      status: { not: 'SOLD' }
    },
    select: {
      id: true,
      name: true,
      sellingFormat: true,
      buyNowPrice: true,
      currentBid: true,
      status: true
    },
    orderBy: { createdAt: 'asc' }
  })

  return {
    success: true,
    data: items.map((item) => ({
      ...item,
      buyNowPrice: item.buyNowPrice ? Number(item.buyNowPrice) : null,
      currentBid: item.currentBid ? Number(item.currentBid) : null
    }))
  }
}
