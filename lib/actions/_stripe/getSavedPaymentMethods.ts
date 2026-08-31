'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'

export async function getSavedPaymentMethods() {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: gate.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        stripePaymentId: true,
        cardholderName: true,
        cardBrand: true,
        cardLast4: true,
        cardExpMonth: true,
        cardExpYear: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      }
    })

    return { success: true, data: paymentMethods }
  } catch (error) {
    await createLog('error', 'Failed to fetch saved payment methods', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to get saved payment methods.', data: null }
  }
}
