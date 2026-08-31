'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AuthFailure, requireAuth } from '../../auth/requireAuth'

export const verifyBypassCode = async (bypassCode: string) => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    if (!bypassCode?.trim()) {
      return { isValid: false, error: 'Missing bypass code', data: null }
    }

    const code = await prisma.adoptionApplicationBypassCode.findUnique({
      where: { bypassCode: bypassCode.trim() }
    })

    if (!code) {
      return { isValid: false, error: 'Invalid bypass code', data: null }
    }

    let adoptionFeeId: string | null = null

    if (gate.userId) {
      // Check for existing active non-expired fee
      const existingFee = await prisma.adoptionFee.findFirst({
        where: {
          userId: gate.userId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        },
        select: { id: true }
      })

      if (existingFee) {
        adoptionFeeId = existingFee.id
      } else {
        // No active fee — create one
        const newFee = await prisma.adoptionFee.create({
          data: {
            bypassCode: bypassCode.trim(),
            feeAmount: 0,
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userId: gate.userId
          }
        })
        adoptionFeeId = newFee.id
      }
    }

    return {
      isValid: true,
      data: { adoptionFeeId }
    }
  } catch (error) {
    await createLog('error', 'Failed to verify bypass code', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { isValid: false, error: 'Failed to verify bypass code. Please try again.', data: null }
  }
}
