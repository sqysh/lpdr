'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { createAuctionSchema } from 'lib/schemas/auction.schema'
import type { ActionResult } from 'types/action.types'
import { slugify } from 'lib/utils/slug.utils'

export const createAuction = async (input: unknown): Promise<ActionResult<{ id: string }>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(createAuctionSchema, input)
  if (parsed.ok === false) return parsed.result

  const { title, startDate, endDate, status, goal } = parsed.data

  try {
    // Slug is generated from the title; admins can rename it in settings later
    const base = slugify(title) || 'auction'

    let customAuctionLink = base
    let suffix = 2

    while (
      await prisma.auction.findUnique({
        where: { customAuctionLink },
        select: { id: true }
      })
    ) {
      customAuctionLink = `${base}-${suffix}`
      suffix += 1
    }

    const auction = await prisma.auction.create({
      data: { title, status, goal, customAuctionLink, startDate, endDate }
    })

    const payload = {
      auctionId: auction.id,
      title: auction.title,
      status: auction.status,
      startDate: auction.startDate,
      endDate: auction.endDate,
      createdBy: gate.userId
    }

    await Promise.all([createLog('info', 'Auction created', payload), pusherSuperuser('auction-created', payload)])

    return { success: true, data: { id: auction.id } }
  } catch (error) {
    // Two auctions created at the same instant can pick the same slug
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, data: null, error: 'Please try again.' }
    }

    await createLog('error', 'Failed to create auction', { error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to create auction. Please try again.' }
  }
}
