'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import sendConfirmationEmail from 'lib/email/sendConfirmationEmail'
import { markAgreementPaidSchema } from 'lib/schemas/adoption-agreement.schema'
import { agreementTotal } from 'lib/utils/adoption-agreement.utils'
import type { ActionResult } from 'types/action.types'
import { notifyAwaitingCountersign } from 'lib/adoption-agreement/notify-countersign'

export async function markAgreementPaid(input: unknown): Promise<ActionResult<{ orderId: string }>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(markAgreementPaidSchema, input)
  if (parsed.ok === false) return parsed.result

  const { agreementId, receivedOn, reference } = parsed.data
  const paidAt = receivedOn ?? new Date()

  try {
    const agreement = await prisma.adoptionAgreement.findUnique({ where: { id: agreementId } })
    if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

    // Card payments are recorded by the webhook when Stripe confirms them, never by hand
    if (agreement.paymentMethod === 'CARD') {
      return { success: false, data: null, error: 'This agreement is set up for card payment, which is recorded automatically.' }
    }

    const total = agreementTotal({
      adoptionFee: Number(agreement.adoptionFee),
      healthCertificateFee: agreement.healthCertificateFee == null ? null : Number(agreement.healthCertificateFee),
      additionalDonation: agreement.additionalDonation == null ? null : Number(agreement.additionalDonation)
    })

    // The order and the agreement move together, so there's never a paid agreement without its order
    // in Transactions. SIGNED in the where: a second click finds nothing and writes nothing
    const orderId = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          type: 'ADOPTION_AGREEMENT',
          status: 'CONFIRMED',
          totalAmount: total,
          subtotal: total,
          customerEmail: agreement.email,
          customerName: [agreement.firstName, agreement.lastName].filter(Boolean).join(' '),
          customerPhone: agreement.phone,
          userId: agreement.userId,
          paidAt,
          offlinePaymentMethod: agreement.paymentMethod,
          notes: reference
        },
        select: { id: true }
      })

      await tx.adoptionAgreement.update({
        where: { id: agreementId, status: 'SIGNED' },
        data: { status: 'PAID', paidAt, orderId: order.id, markedPaidById: gate.userId },
        select: { id: true }
      })

      return order.id
    })

    // Lets the preparer know it's waiting for their signature, unless they're the one who just recorded it
    await notifyAwaitingCountersign(agreementId, { skipUserId: gate.userId })

    // The same receipt a card payer gets. The payment is recorded either way, so a failed email is logged, not undone
    try {
      const orderWithItems = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          items: true,
          adoptionAgreement: {
            select: { id: true, dogName: true, adoptionFee: true, healthCertificateFee: true, additionalDonation: true }
          }
        }
      })
      await sendConfirmationEmail(orderWithItems)
    } catch (error) {
      await createLog('error', 'Adoption payment receipt failed to send', { agreementId, orderId, error: getErrorMessage(error) })
    }

    const payload = {
      agreementId,
      orderId,
      dogName: agreement.dogName,
      amount: total,
      method: agreement.paymentMethod,
      markedBy: gate.userId
    }

    await Promise.all([
      createLog('info', 'Adoption agreement marked paid', payload),
      pusherSuperuser('adoption-agreement-paid', payload).catch(() => {})
    ])

    return { success: true, data: { orderId } }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { success: false, data: null, error: 'This agreement is not waiting for payment. It may already be paid or not yet signed.' }
    }

    await createLog('error', 'Failed to mark adoption agreement paid', { agreementId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to record the payment. Please try again.' }
  }
}
