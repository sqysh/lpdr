import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'

export const getAuctionWinningBidderById = async (id: string) => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const winningBidder = await prisma.auctionWinningBidder.findFirst({
      where: { id, userId: gate.userId },
      include: {
        auction: {
          select: { id: true, title: true, customAuctionLink: true }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, address: true }
        },
        auctionItems: {
          include: {
            photos: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }]
            }
          }
        }
      }
    })

    if (!winningBidder) return { success: false, error: 'Not found', data: null }

    return { success: true, error: null, data: serialize(winningBidder) }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction winning bidder', {
      id,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to fetch data', data: null }
  }
}
