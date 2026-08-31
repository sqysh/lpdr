'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { stampUserGeoFromRequest } from '../auth/stampUserGeoFromRequest'
import { getErrorMessage } from 'app/utils/_error.utils'

export const setDefaultPaymentMethod = async (id: string) => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!paymentMethod) return { success: false, error: 'Payment method not found' }
    if (paymentMethod.userId !== gate.userId) return { success: false, error: 'Unauthorized' }

    const [details] = await Promise.all([
      stampUserGeoFromRequest(gate.userId),
      prisma.$transaction([
        prisma.paymentMethod.updateMany({
          where: { userId: gate.userId },
          data: { isDefault: false }
        }),
        prisma.paymentMethod.update({
          where: { id },
          data: { isDefault: true }
        })
      ])
    ])

    await createLog('info', 'Default payment method updated', {
      userId: gate.userId,
      paymentMethodId: id,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to set default payment method', {
      userId: gate.userId,
      paymentMethodId: id,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to update payment method' }
  }
}
