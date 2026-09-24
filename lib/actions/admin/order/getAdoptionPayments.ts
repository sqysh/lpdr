'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'
import type { DecimalToNumber } from 'types/prisma.types'
import type { ActionResult } from 'types/action.types'

const adoptionPaymentArgs = Prisma.validator<Prisma.OrderDefaultArgs>()({
  select: {
    id: true,
    status: true,
    totalAmount: true,
    coverFees: true,
    feesCovered: true,
    customerName: true,
    customerEmail: true,
    paidAt: true,
    createdAt: true,
    // The agreement carries what the order can't: which dog, the fee split, and how it was paid
    adoptionAgreement: {
      select: {
        id: true,
        dogName: true,
        dogPhoto: true,
        adoptionFee: true,
        healthCertificateFee: true,
        additionalDonation: true,
        paymentMethod: true,
        status: true
      }
    }
  }
})

export type IAdoptionPaymentRow = DecimalToNumber<Prisma.OrderGetPayload<typeof adoptionPaymentArgs>>

export const getAdoptionPayments = async (): Promise<ActionResult<IAdoptionPaymentRow[]>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const payments = await prisma.order.findMany({
      ...adoptionPaymentArgs,
      where: { type: 'ADOPTION_AGREEMENT' },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: serialize(payments) }
  } catch (error) {
    await createLog('error', 'Failed to load adoption payments', { loadedBy: gate.userId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to load adoption payments' }
  }
}
