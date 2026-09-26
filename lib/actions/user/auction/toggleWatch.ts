'use server'

import prisma from 'prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

/** Watches the item if it isn't watched yet, otherwise stops. Returns the new state. */
export async function toggleWatch(auctionItemId: string): Promise<ActionResult<{ watching: boolean }>> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const key = { userId_auctionItemId: { userId: gate.userId, auctionItemId } }
    const existing = await prisma.auctionItemWatch.findUnique({ where: key, select: { id: true } })

    if (existing) {
      await prisma.auctionItemWatch.delete({ where: key })
      return { success: true, data: { watching: false } }
    }

    await prisma.auctionItemWatch.create({ data: { userId: gate.userId, auctionItemId } })
    return { success: true, data: { watching: true } }
  } catch (error) {
    await createLog('error', 'Failed to toggle watch', { auctionItemId, userId: gate.userId, error: getErrorMessage(error) })
    return { success: false, data: null, error: "Couldn't update your watchlist. Please try again." }
  }
}
