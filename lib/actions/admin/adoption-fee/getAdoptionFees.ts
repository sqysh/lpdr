'use server'

import prisma from 'prisma/client'
import { getErrorMessage } from 'app/utils/_error.utils'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { createLog } from '../../log/createLog'

export const getAdoptionFees = async () => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const adoptionFees = await prisma.adoptionFee.findMany({
      where: { expiresAt: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { geoRegion: true } } }
    })

    return { success: true, data: adoptionFees, error: null }
  } catch (error) {
    await createLog('error', 'Failed to get adoption fees', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to get adoption fees. Please try again.', data: null }
  }
}
