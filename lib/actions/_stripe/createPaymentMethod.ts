'use server'

import prisma from 'prisma/client'
import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { stampUserGeoFromRequest } from '../auth/stampUserGeoFromRequest'
import { getErrorMessage } from 'app/utils/_error.utils'

export async function createPaymentMethod({
  stripePaymentMethodId,
  isDefault,
  cardholderName
}: {
  stripePaymentMethodId: string
  isDefault: boolean
  cardholderName: string
}) {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const [paymentMethod, details] = await Promise.all([
      stripeClient.paymentMethods.retrieve(stripePaymentMethodId),
      stampUserGeoFromRequest(gate.userId)
    ])

    if (paymentMethod.type !== 'card' || !paymentMethod.card) {
      await createLog('error', 'Invalid Stripe payment method type', {
        stripePaymentMethodId,
        type: paymentMethod.type,
        userId: gate.userId
      })
      return { success: false, error: 'Invalid payment method', data: null }
    }

    const existing = await prisma.paymentMethod.findUnique({
      where: { stripePaymentId: paymentMethod.id }
    })

    if (existing) {
      return { success: true, id: existing.id }
    }

    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: gate.userId, isDefault: true },
        data: { isDefault: false }
      })
    } else {
      const hasDefault = await prisma.paymentMethod.findFirst({
        where: { userId: gate.userId, isDefault: true }
      })
      if (!hasDefault) isDefault = true
    }

    const created = await prisma.paymentMethod.create({
      data: {
        stripePaymentId: paymentMethod.id,
        cardholderName: cardholderName || null,
        cardBrand: paymentMethod.card.brand,
        cardLast4: paymentMethod.card.last4,
        cardExpMonth: paymentMethod.card.exp_month,
        cardExpYear: paymentMethod.card.exp_year,
        isDefault,
        userId: gate.userId
      }
    })

    await createLog('info', 'Payment method saved', {
      paymentMethodId: created.id,
      userId: gate.userId,
      brand: created.cardBrand,
      last4: created.cardLast4,
      isDefault,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true, id: created.id }
  } catch (error) {
    await createLog('error', 'Failed to create payment method', {
      stripePaymentMethodId,
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to save payment method. Please try again.' }
  }
}
