'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { isDynamicServerError } from 'next/dist/client/components/hooks-server-context'
import { AuthFailure, requireAuth } from '../../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'

export const hasActiveAdoptionFee = async () => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const fee = await prisma.adoptionFee.findFirst({
      where: {
        userId: gate.userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      },
      select: { id: true, expiresAt: true }
    })

    if (!fee) return { isActive: false, expiresAt: null }

    return {
      isActive: true,
      expiresAt: fee.expiresAt
    }
  } catch (error) {
    if (isDynamicServerError(error)) throw error

    await createLog('error', 'Failed to check active adoption fee', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { isActive: false, expiresAt: null }
  }
}
