'use server'

import prisma from 'prisma/client'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { createAuctionItemSchema } from 'lib/schemas/auction.schema'
import type { ActionResult } from 'types/action.types'
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
          : undefined,
        status: auction.status === 'ACTIVE' ? 'ACTIVE' : 'UNSOLD'
      }
    })

    const payload = {
      auctionItemId: item.id,
      auctionId,
      name,
      sellingFormat,
      createdBy: gate.userId,
      // An item added mid-auction goes straight to bidders, so it should stand out in the feed
      duringLiveAuction: auction.status === 'ACTIVE'
    }

    // The item is already saved, so a feed failure is logged rather than reported as a failed create, which would invite a duplicate
    await Promise.all([
      createLog('info', 'Auction item created', payload),
      pusherSuperuser('auction-item-created', payload).catch((error) =>
        createLog('error', 'Failed to push auction-item-created to super feed', { auctionItemId: item.id, error: getErrorMessage(error) })
      )
    ])

    return { success: true, data: { sellingFormat: item.sellingFormat } }
  } catch (error) {
    await createLog('error', 'Failed to create auction item', {
      auctionId,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to create auction item' }
  }
}
