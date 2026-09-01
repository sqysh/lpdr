'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireSuper } from 'lib/auth/guards'

export const deleteAuction = async (id: string) => {
  const gate = await requireSuper()
  if (gate.ok === false) {
    await createLog('warn', 'Unauthorized deleteAuction attempt', { id })
    return { success: false, error: gate.error, data: null }
  }

  try {
    if (!id) return { success: false, error: 'Missing id', data: null }

    const auction = await prisma.auction.findUnique({
      where: { id },
      select: { status: true, title: true }
    })

    if (!auction) return { success: false, error: 'Auction not found', data: null }

    if (auction.status !== 'DRAFT') {
      return {
        success: false,
        error: 'Only draft auctions can be deleted.',
        data: null
      }
    }

    await prisma.auction.delete({ where: { id } })

    await createLog('info', 'Auction deleted', { id, title: auction.title })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to delete auction', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id
    })

    return {
      success: false,
      error: 'Failed to delete auction. Please try again.',
      data: null
    }
  }
}
