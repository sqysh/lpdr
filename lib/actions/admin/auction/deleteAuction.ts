'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'

export const deleteAuction = async (id: string) => {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

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
