'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { UpdateAuctionItemInput } from 'types/_auction-item'
import { getErrorMessage } from 'app/utils/_error.utils'

export const updateAuctionItem = async (id: string, data: UpdateAuctionItemInput) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error, data: null }

  if (!data.name?.trim()) return { success: false, error: 'Name is required', data: null }

  try {
    const item = await prisma.auctionItem.findUnique({
      where: { id },
      select: { totalBids: true, auction: { select: { status: true } } }
    })
    if (!item) return { success: false, error: 'Item not found', data: null }

    const isActive = item.auction.status === 'ACTIVE'
    const newStartingPrice = data.startingPrice != null ? Number(data.startingPrice) : null

    await prisma.auctionItem.update({
      where: { id },
      data: isActive
        ? {
            name: data.name.trim(),
            description: data.description?.trim() || null
          }
        : {
            name: data.name.trim(),
            description: data.description?.trim() || null,
            sellingFormat: data.sellingFormat,
            startingPrice: newStartingPrice,
            buyNowPrice: data.buyNowPrice != null ? Number(data.buyNowPrice) : null,
            totalQuantity: data.totalQuantity ? Number(data.totalQuantity) : null,
            requiresShipping: data.requiresShipping ?? true,
            shippingCosts: data.shippingCosts != null ? Number(data.shippingCosts) : null,
            isAuction: data.sellingFormat === 'AUCTION',
            isFixed: data.sellingFormat === 'FIXED',
            ...(item.totalBids === 0 && newStartingPrice != null
              ? { currentBid: newStartingPrice, minimumBid: newStartingPrice }
              : {})
          }
    })

    if (data.photos?.length) {
      const [last, existingCount] = await Promise.all([
        prisma.auctionItemPhoto.findFirst({
          where: { itemId: id },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true }
        }),
        prisma.auctionItemPhoto.count({ where: { itemId: id } })
      ])

      await prisma.auctionItemPhoto.createMany({
        data: data.photos.map((url: string, i: number) => ({
          itemId: id,
          url,
          isPrimary: existingCount === 0 && i === 0,
          sortOrder: (last?.sortOrder ?? -1) + 1 + i
        }))
      })
    }

    return { success: true, data: null, error: null }
  } catch (error) {
    await createLog('error', 'Failed to update auction item', {
      auctionItemId: id,
      auctionId: data.auctionId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to update auction item', data: null }
  }
}
