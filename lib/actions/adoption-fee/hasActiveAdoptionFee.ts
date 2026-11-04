import 'server-only'
import { cache } from 'react'
import { unstable_rethrow } from 'next/navigation'
import prisma from 'prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../log/createLog'

type ActiveFee = { isActive: boolean; expiresAt: Date | null }

const NONE: ActiveFee = { isActive: false, expiresAt: null }

export const hasActiveAdoptionFee = cache(async (): Promise<ActiveFee> => {
  const gate = await requireAuth()
  // Signed out simply means no fee, which is most visitors on most pages
  if (gate.ok === false) return NONE

  try {
    const fee = await prisma.adoptionFee.findFirst({
      where: { userId: gate.userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      select: { expiresAt: true }
    })

    return fee ? { isActive: true, expiresAt: fee.expiresAt } : NONE
  } catch (error) {
    unstable_rethrow(error)

    await createLog('error', 'Failed to check active adoption fee', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return NONE
  }
})
