import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireAdmin } from 'lib/auth/guards'
import { serialize } from 'lib/utils/serializers.utils'
import { auctionDetailArgs } from 'types/auction.types'

export const getAuctionById = async (id: string) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const auction = await prisma.auction.findUnique({ where: { id }, ...auctionDetailArgs })

    if (!auction) return { success: false, error: 'Auction not found', data: null }

    return { success: true, error: null, data: serialize(auction) }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction', {
      id,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to fetch auction', data: null }
  }
}
