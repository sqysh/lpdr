'use server'

import prisma from 'prisma/client'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { validateAuctionHour } from 'lib/utils/auction.utils'

type CreateAuctionInput = {
  title: string
  startDate: Date
  endDate: Date
  status?: 'DRAFT' | 'ACTIVE' | 'ENDED'
  goal?: number
  customAuctionLink?: string
}

export const createAuction = async (data: CreateAuctionInput) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  if (!data.title?.trim()) {
    return { success: false, error: 'Title is required', data: null }
  }

  if (!data.startDate || !data.endDate) {
    return { success: false, error: 'Start and end date are required', data: null }
  }

  if (data.startDate >= data.endDate) {
    return { success: false, error: 'Start date must be before end date', data: null }
  }

  const startHourError = validateAuctionHour(data.startDate.toISOString())
  if (startHourError) return { success: false, error: `Start time: ${startHourError}`, data: null }

  const endHourError = validateAuctionHour(data.endDate.toISOString())
  if (endHourError) return { success: false, error: `End time: ${endHourError}`, data: null }

  try {
    const auction = await prisma.auction.create({
      data: {
        title: data.title.trim(),
        status: data.status ?? 'DRAFT',
        goal: data.goal ?? 1000,
        customAuctionLink: data.customAuctionLink?.trim(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate)
      }
    })

    await Promise.all([
      createLog('info', 'Auction created', {
        auctionId: auction.id,
        title: auction.title,
        status: auction.status,
        startDate: auction.startDate,
        endDate: auction.endDate,
        createdBy: gate.userId
      }),
      pusherSuperuser('auction-created', {
        auctionId: auction.id,
        title: auction.title,
        status: auction.status,
        startDate: auction.startDate,
        endDate: auction.endDate,
        createdBy: gate.userId
      })
    ])

    return { success: true, data: { id: auction.id } }
  } catch (error) {
    await createLog('error', 'Failed to create auction', {
      error: getErrorMessage(error),
      title: data.title
    })

    return { success: false, error: 'Failed to create auction. Please try again.', data: null }
  }
}
