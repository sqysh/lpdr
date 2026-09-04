'use server'

import prisma from 'prisma/client'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import type { ActionResult } from 'types/_action.types'
import { IAdoptionFee } from 'types/_adoption-fee'

export const getAdoptionFees = async (): Promise<ActionResult<IAdoptionFee[]>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const adoptionFees = await prisma.adoptionFee.findMany({
      where: { expiresAt: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { geoRegion: true } } }
    })

    return {
      success: true,
      data: adoptionFees.map((fee) => ({
        id: fee.id,
        firstName: fee.firstName,
        lastName: fee.lastName,
        email: fee.email,
        state: fee.state,
        feeAmount: fee.feeAmount ? Number(fee.feeAmount) : null,
        bypassCode: fee.bypassCode,
        expiresAt: fee.expiresAt,
        status: fee.status,
        createdAt: fee.createdAt,
        geoRegion: fee.order?.geoRegion ?? null
      }))
    }
  } catch (error) {
    await createLog('error', 'Failed to get adoption fees', { error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to get adoption fees. Please try again.' }
  }
}
