'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireSuper } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export const deleteAuction = async (id: string): Promise<ActionResult<null>> => {
  const gate = await requireSuper()
  if (gate.ok === false) {
    await createLog('warn', 'Unauthorized deleteAuction attempt', { id })
    return { success: false, data: null, error: gate.error }
  }

  if (!id) return { success: false, data: null, error: 'Missing id' }

  try {
    const auction = await prisma.auction.findUnique({
      where: { id },
      select: { status: true, title: true }
    })

    if (!auction) return { success: false, data: null, error: 'Auction not found' }

    if (auction.status !== 'DRAFT') {
      return { success: false, data: null, error: 'Only draft auctions can be deleted.' }
    }

    await prisma.auction.delete({ where: { id } })

    await createLog('info', 'Auction deleted', { id, title: auction.title, deletedBy: gate.userId })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to delete auction', { error: getErrorMessage(error), id })

    return { success: false, data: null, error: 'Failed to delete auction. Please try again.' }
  }
}
