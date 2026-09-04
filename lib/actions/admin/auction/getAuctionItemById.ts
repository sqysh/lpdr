import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { serialize } from 'lib/utils/serializers.utils'
import { auctionItemDetailArgs } from 'types/auction.types'

export const getAuctionItemById = async (id: string) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const item = await prisma.auctionItem.findUnique({ where: { id }, ...auctionItemDetailArgs })

  if (!item) return { success: false, error: 'Auction item not found', data: null }

  return { success: true, error: null, data: serialize(item) }
}
