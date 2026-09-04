'use server'

import prisma from 'prisma/client'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { createAuctionItemSchema } from 'lib/schemas/auction.schema'
import type { ActionResult } from 'types/_action.types'
import type { SellingFormat } from '@prisma/client'

export const createAuctionItem = async (input: unknown): Promise<ActionResult<{ sellingFormat: SellingFormat }>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(createAuctionItemSchema, input)
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
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { status: true }
    })

    if (!auction) return { success: false, data: null, error: 'Auction not found' }

    if (auction.status === 'ENDED') {
      return { success: false, data: null, error: 'This auction has already ended' }
    }

    const isAuction = sellingFormat === 'AUCTION'

    const item = await prisma.auctionItem.create({
      data: {
        auctionId,
        name,
        description: description || null,
        sellingFormat,
        startingPrice: startingPrice ?? null,
        buyNowPrice: buyNowPrice ?? null,
        currentPrice: startingPrice ?? null,
        currentBid: startingPrice ?? null,
        minimumBid: startingPrice ?? null,
        totalQuantity: isAuction ? 1 : totalQuantity,
        requiresShipping,
        shippingCosts: shippingCosts ?? null,
        isAuction,
        isFixed: !isAuction,
        photos: photos.length
          ? {
              create: photos.map((url, i) => ({ url, isPrimary: i === 0, sortOrder: i }))
            }
          : undefined
      }
    })

    const payload = {
      auctionItemId: item.id,
      auctionId,
      name,
      sellingFormat,
      createdBy: gate.userId
    }

    await Promise.all([createLog('info', 'Auction item created', payload), pusherSuperuser('auction-item-created', payload)])

    return { success: true, data: { sellingFormat: item.sellingFormat } }
  } catch (error) {
    await createLog('error', 'Failed to create auction item', {
      auctionId,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to create auction item' }
  }
}
