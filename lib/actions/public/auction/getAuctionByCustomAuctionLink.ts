import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { serialize } from 'lib/utils/serializers.utils'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'
import { auctionLiveArgs, PublicAuction } from 'types/auction.types'
import { bidderDisplay } from 'lib/utils/auction.utils'

export const getAuctionByCustomAuctionLink = async (link: string): Promise<ActionResult<PublicAuction>> => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { customAuctionLink: link },
      ...auctionLiveArgs
    })

    if (!auction) return { success: false, data: null, error: 'Auction not found' }

    return {
      success: true,
      data: serialize({
        ...auction,
        items: auction.items.map((item) => ({
          ...item,
          bids: item.bids.map(({ user, ...bid }) => ({ ...bid, displayName: bidderDisplay({ user }) }))
        })),
        // Auction-level bids carry the same names.
        bids: auction.bids.map(({ user, ...bid }) => ({ ...bid, displayName: bidderDisplay({ user }) }))
      })
    }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction by custom link', {
      link,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to load auction' }
  }
}
