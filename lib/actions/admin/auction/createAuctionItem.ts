'use server'

import prisma from 'prisma/client'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { CreateAuctionItemInput } from 'types/_auction-item'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'

export const createAuctionItem = async (data: CreateAuctionItemInput) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  if (!data.name?.trim()) return { success: false, error: 'Name is required', data: null }
  if (!data.sellingFormat)
    return { success: false, error: 'Selling format is required', data: null }

  try {
    const item = await prisma.auctionItem.create({
      data: {
        auctionId: data.auctionId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        sellingFormat: data.sellingFormat,
        startingPrice: data.startingPrice ? Number(data.startingPrice) : null,
        buyNowPrice: data.buyNowPrice ? Number(data.buyNowPrice) : null,
        currentPrice: data.startingPrice ? Number(data.startingPrice) : null,
        currentBid: data.startingPrice ? Number(data.startingPrice) : null,
        minimumBid: data.startingPrice ? Number(data.startingPrice) : null,
        totalQuantity: data.sellingFormat === 'FIXED' ? data.totalQuantity : 1,
        requiresShipping: data.requiresShipping ?? true,
        shippingCosts: data.shippingCosts ? Number(data.shippingCosts) : null,
        isAuction: data.sellingFormat === 'AUCTION',
        isFixed: data.sellingFormat === 'FIXED',
        photos:
          data.photos?.length > 0
            ? {
                create: data.photos.map((url: string, i: number) => ({
                  url,
                  isPrimary: i === 0,
                  sortOrder: i
                }))
              }
            : undefined
      }
    })

    await Promise.all([
      createLog('info', 'Auction item created', {
        auctionItemId: item.id,
        auctionId: data.auctionId,
        name: data.name.trim(),
        sellingFormat: data.sellingFormat,
        createdBy: gate.userId
      }),
      pusherSuperuser('auction-item-created', {
        auctionItemId: item.id,
        auctionId: data.auctionId,
        name: data.name.trim(),
        sellingFormat: data.sellingFormat,
        createdBy: gate.userId
      })
    ])

    return { success: true, data: { sellingFormat: item.sellingFormat } }
  } catch (error) {
    await createLog('error', 'Failed to create auction item', {
      auctionId: data.auctionId,
      name: data.name,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to create auction item', data: null }
  }
}
