'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export const setDefaultPaymentMethod = async (id: string): Promise<ActionResult<null>> => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const { userId } = gate

  try {
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id, userId },
      select: { id: true }
    })

    if (!paymentMethod) {
      return { success: false, data: null, error: 'Payment method not found' }
    }

    const [details] = await Promise.all([
      stampUserGeoFromRequest(userId),
      prisma.$transaction([
        prisma.paymentMethod.updateMany({
          where: { userId },
          data: { isDefault: false }
        }),
        prisma.paymentMethod.update({
          where: { id },
          data: { isDefault: true }
        })
      ])
    ])

    await createLog('info', 'Default payment method updated', {
      userId,
      paymentMethodId: id,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to set default payment method', {
      userId,
      paymentMethodId: id,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to update payment method' }
  }
}
