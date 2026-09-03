'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { stripeClient } from 'lib/stripe/stripe-client'
import { requireAuth } from 'lib/auth/guards'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/_action.types'

export const deletePaymentMethod = async (id: string): Promise<ActionResult<null>> => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const { userId } = gate

  try {
    // Scoped to the caller — an id for someone else's card simply isn't found
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id, userId },
      select: { stripePaymentId: true, isDefault: true }
    })

    if (!paymentMethod) {
      return { success: false, data: null, error: 'Payment method not found' }
    }

    const activeSubscription = await prisma.order.findFirst({
      where: {
        userId,
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
        data: null,
        error:
          'This card is tied to an active subscription. Please update your subscription payment method before removing this card.'
      }
    }

    const [details] = await Promise.all([
      stampUserGeoFromRequest(userId),
      stripeClient.paymentMethods.detach(paymentMethod.stripePaymentId),
      prisma.paymentMethod.delete({ where: { id } })
    ])

    if (paymentMethod.isDefault) {
      const next = await prisma.paymentMethod.findFirst({
        where: { userId },
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
      userId,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to delete payment method', {
      userId,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to delete payment method' }
  }
}
