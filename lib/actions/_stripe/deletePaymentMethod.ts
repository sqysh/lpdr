'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { stripeClient } from 'lib/stripe/stripe-client'
import { requireAuth } from 'lib/auth/guards'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import { getErrorMessage } from 'app/utils/_error.utils'

export const deletePaymentMethod = async (id: string) => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    // Verify ownership
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      select: { userId: true, stripePaymentId: true, isDefault: true }
    })

    if (!paymentMethod) return { success: false, error: 'Payment method not found' }
    if (paymentMethod.userId !== gate.userId) return { success: false, error: 'Unauthorized' }

    // Check if card is tied to an active subscription
    const activeSubscription = await prisma.order.findFirst({
      where: {
        userId: gate.userId,
        isRecurring: true,
        type: 'RECURRING_DONATION',
        status: 'CONFIRMED',
        paymentMethodId: paymentMethod.stripePaymentId
      },
      select: { id: true }
    })

    if (activeSubscription) {
      return {
        success: false,
        error:
          'This card is tied to an active subscription. Please update your subscription payment method before removing this card.'
      }
    }

    const [details] = await Promise.all([
      stampUserGeoFromRequest(gate.userId),
      stripeClient.paymentMethods.detach(paymentMethod.stripePaymentId),
      prisma.paymentMethod.delete({ where: { id } })
    ])

    if (paymentMethod.isDefault) {
      const next = await prisma.paymentMethod.findFirst({
        where: { userId: gate.userId },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      })
      if (next) {
        await prisma.paymentMethod.update({
          where: { id: next.id },
          data: { isDefault: true }
        })
      }
    }

    await createLog('info', 'Payment method deleted', {
      userId: gate.userId,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to delete payment method', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to delete payment method' }
  }
}
