import prisma from 'prisma/client'
import { serialize } from 'lib/utils/serializers.utils'
import { auctionItemLiveArgs } from 'types/auction.types'
import { bidderDisplay } from 'lib/utils/auction.utils'

export const getPublicAuctionItemById = async (id: string) => {
  const item = await prisma.auctionItem.findFirst({
    where: { id, auction: { status: { in: ['ACTIVE', 'ENDED'] } } },
    ...auctionItemLiveArgs
  })

  if (!item) return { success: false, error: 'Auction item not found', data: null }

  return {
    success: true,
    error: null,
    data: serialize({
      ...item,
      bids: item.bids.map(({ user, ...bid }) => ({ ...bid, displayName: bidderDisplay({ user }) }))
    })
  }
}
