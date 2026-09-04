'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { updateAuctionItemSchema } from 'lib/schemas/auction.schema'
import type { ActionResult } from 'types/_action.types'

export const updateAuctionItem = async (id: string, input: unknown): Promise<ActionResult<null>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(updateAuctionItemSchema, input)
  if (parsed.ok === false) return parsed.result

  const {
    auctionId,
    name,
    description,
    sellingFormat,
    startingPrice,
    buyNowPrice,
    totalQuantity,
    requiresShipping,
    shippingCosts,
    photos
  } = parsed.data

  try {
    const item = await prisma.auctionItem.findFirst({
      where: { id, auctionId },
      select: { totalBids: true, auction: { select: { status: true } } }
    })

    if (!item) return { success: false, data: null, error: 'Item not found' }

    if (item.auction.status === 'ENDED') {
      return { success: false, data: null, error: 'This auction has already ended' }
    }

    const isActive = item.auction.status === 'ACTIVE'
    const isAuction = sellingFormat === 'AUCTION'

    // While an auction is live, only the copy can change — prices and format
    // are locked so bidders aren't chasing a moving target.
    const data = isActive
      ? { name, description: description || null }
      : {
          name,
          description: description || null,
          sellingFormat,
          startingPrice: startingPrice ?? null,
          buyNowPrice: buyNowPrice ?? null,
          totalQuantity: isAuction ? 1 : totalQuantity,
          requiresShipping,
          shippingCosts: shippingCosts ?? null,
          isAuction,
          isFixed: !isAuction,
          ...(item.totalBids === 0 && startingPrice != null
            ? { currentBid: startingPrice, minimumBid: startingPrice, currentPrice: startingPrice }
            : {})
        }

    await prisma.auctionItem.update({ where: { id }, data })

    if (photos.length) {
      const [last, existingCount] = await Promise.all([
        prisma.auctionItemPhoto.findFirst({
          where: { itemId: id },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true }
        }),
        prisma.auctionItemPhoto.count({ where: { itemId: id } })
      ])

      await prisma.auctionItemPhoto.createMany({
        data: photos.map((url, i) => ({
          itemId: id,
          url,
          isPrimary: existingCount === 0 && i === 0,
          sortOrder: (last?.sortOrder ?? -1) + 1 + i
        }))
      })
    }

    await createLog('info', 'Auction item updated', {
      auctionItemId: id,
      auctionId,
      name,
      updatedBy: gate.userId
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update auction item', {
      auctionItemId: id,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to update auction item' }
  }
}
