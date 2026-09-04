'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { updateAuctionSchema } from 'lib/schemas/auction.schema'
import type { ActionResult } from 'types/action.types'

export const updateAuction = async (id: string, input: unknown): Promise<ActionResult<null>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  if (!id) return { success: false, data: null, error: 'Missing id' }

  const parsed = parseInput(updateAuctionSchema, input)
  if (parsed.ok === false) return parsed.result

  const { title, startDate, endDate, goal, customAuctionLink } = parsed.data

  try {
    const existing = await prisma.auction.findUnique({
      where: { id },
      select: { startDate: true, endDate: true }
    })

    if (!existing) return { success: false, data: null, error: 'Auction not found' }

    // Only one date may be sent, so compare against what is stored
    const nextStart = startDate ?? existing.startDate
    const nextEnd = endDate ?? existing.endDate

    if (nextStart && nextEnd && nextStart >= nextEnd) {
      return { success: false, data: null, error: 'End date must be after start date' }
    }

    if (customAuctionLink) {
      const taken = await prisma.auction.findFirst({
        where: { customAuctionLink, id: { not: id } },
        select: { id: true }
      })

      if (taken) {
        return { success: false, data: null, error: 'That auction link is already in use' }
      }
    }

    await prisma.auction.update({
      where: { id },
      data: {
        ...(title != null && { title }),
        ...(goal != null && { goal }),
        ...(customAuctionLink != null && { customAuctionLink }),
        ...(startDate != null && { startDate }),
        ...(endDate != null && { endDate })
      }
    })

    await createLog('info', 'Auction updated', {
      auctionId: id,
      updatedBy: gate.userId,
      fields: Object.keys(parsed.data)
    })

    return { success: true, data: null }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, data: null, error: 'That auction link is already in use' }
    }

    await createLog('error', 'Failed to update auction', {
      auctionId: id,
      updatedBy: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, data: null, error: 'Failed to update auction. Please try again.' }
  }
}
