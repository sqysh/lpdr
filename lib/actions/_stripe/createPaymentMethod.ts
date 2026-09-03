'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/_action.types'

type Params = {
  stripePaymentMethodId: string
  isDefault: boolean
  cardholderName?: string
}

export async function createPaymentMethod({
  stripePaymentMethodId,
  isDefault,
  cardholderName
}: Params): Promise<ActionResult<{ id: string; alreadySaved: boolean }>> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const { userId } = gate

  try {
    const [paymentMethod, details, user] = await Promise.all([
      stripeClient.paymentMethods.retrieve(stripePaymentMethodId),
      stampUserGeoFromRequest(userId),
      prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } })
    ])

    if (paymentMethod.type !== 'card' || !paymentMethod.card) {
      await createLog('error', 'Invalid Stripe payment method type', {
        stripePaymentMethodId,
        type: paymentMethod.type,
        userId
      })
      return { success: false, data: null, error: 'Invalid payment method' }
    }

    if (!user?.stripeCustomerId || paymentMethod.customer !== user.stripeCustomerId) {
      await createLog('warn', 'Payment method does not belong to this user', {
        stripePaymentMethodId,
        userId
      })
      return { success: false, data: null, error: 'Invalid payment method' }
    }

    const { fingerprint, brand, last4, exp_month, exp_year } = paymentMethod.card

    // The same physical card saved twice produces two Stripe payment methods
    // but should only ever be one row. Fingerprint is stable across them.
    const duplicateOf = { userId, ...(fingerprint ? { fingerprint } : {}) }

    const existing = await prisma.paymentMethod.findFirst({
      where: {
        userId,
        OR: [{ stripePaymentId: paymentMethod.id }, ...(fingerprint ? [{ fingerprint }] : [])]
      }
    })

    if (existing) {
      if (paymentMethod.id !== existing.stripePaymentId) {
        await stripeClient.paymentMethods.detach(paymentMethod.id).catch((err) =>
          createLog('warn', 'Failed to detach duplicate payment method', {
            stripePaymentMethodId: paymentMethod.id,
            userId,
            error: getErrorMessage(err)
          })
        )
      }
      return { success: true, data: { id: existing.id, alreadySaved: true } }
    }

    // First card on the account is always the default
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      })
    } else {
      const hasDefault = await prisma.paymentMethod.findFirst({
        where: { userId, isDefault: true },
        select: { id: true }
      })
      if (!hasDefault) isDefault = true
    }

    try {
      const created = await prisma.paymentMethod.create({
        data: {
          stripePaymentId: paymentMethod.id,
          cardholderName: cardholderName?.trim() || null,
          cardBrand: brand,
          cardLast4: last4,
          cardExpMonth: exp_month,
          cardExpYear: exp_year,
          fingerprint: fingerprint ?? null,
          isDefault,
          userId
        }
      })

      await createLog('info', 'Payment method saved', {
        paymentMethodId: created.id,
        userId,
        brand,
        last4,
        isDefault,
        ip: details?.ip,
        device: details?.device,
        city: details?.geoCity,
        country: details?.geoCountry
      })

      return { success: true, data: { id: created.id, alreadySaved: false } }
    } catch (err) {
      // The webhook can create the row between our check and this insert
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const raced = await prisma.paymentMethod.findFirst({ where: duplicateOf })
        if (raced) return { success: true, data: { id: raced.id, alreadySaved: false } }
      }
      throw err
    }
  } catch (error) {
    await createLog('error', 'Failed to create payment method', {
      stripePaymentMethodId,
      userId,
      error: getErrorMessage(error)
    })

    return { success: false, data: null, error: 'Failed to save payment method. Please try again.' }
  }
}
