'use server'

import prisma from 'prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import type { ActionResult } from 'types/action.types'
import { createLog } from '../log/createLog'
import { redeemBypassCodeSchema } from 'lib/schemas/adoption-fee.schema'

const ACCESS_MS = 7 * 24 * 60 * 60 * 1000

export const redeemBypassCode = async (input: unknown): Promise<ActionResult<null>> => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const parsed = parseInput(redeemBypassCodeSchema, input)
  if (parsed.ok === false) return parsed.result

  const { bypassCode, firstName, lastName } = parsed.data

  try {
    const code = await prisma.adoptionApplicationBypassCode.findUnique({
      where: { bypassCode },
      select: { id: true }
    })

    if (!code) {
      await createLog('warn', 'Invalid bypass code', {
        location: ['redeemBypassCode.ts'],
        userId: gate.userId
      })

      return { success: false, error: 'That code is not valid.', data: null }
    }

    // An active fee already covers them, so redeeming again should not extend it
    const existing = await prisma.adoptionFee.findFirst({
      where: { userId: gate.userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      select: { id: true }
    })

    if (!existing) {
      await prisma.adoptionFee.create({
        data: {
          userId: gate.userId,
          bypassCode,
          feeAmount: 0,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + ACCESS_MS),
          email: gate.email,
          firstName,
          lastName
        }
      })

      await createLog('info', 'Bypass code redeemed', {
        location: ['redeemBypassCode.ts'],
        userId: gate.userId,
        email: gate.email
      })
    }

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to redeem bypass code', {
      location: ['redeemBypassCode.ts'],
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Something went wrong. Please try again.', data: null }
  }
}
