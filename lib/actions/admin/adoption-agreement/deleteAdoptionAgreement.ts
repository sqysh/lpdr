'use server'

import prisma from 'prisma/client'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

/** Removes an agreement with its signatures and order, for test runs and agreements started by mistake */
export async function deleteAdoptionAgreement(id: string): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  if (!id) return { success: false, data: null, error: 'Missing agreement' }

  try {
    const agreement = await prisma.adoptionAgreement.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        dogName: true,
        email: true,
        orderId: true,
        order: { select: { id: true, paymentIntentId: true, totalAmount: true, refundedAmount: true } }
      }
    })

    if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

    const order = agreement.order

    // A card charge still sitting in Stripe would vanish from Transactions while the money stays real
    if (order?.paymentIntentId && Number(order.refundedAmount ?? 0) < Number(order.totalAmount)) {
      return { success: false, data: null, error: 'This agreement was paid by card. Refund it in Stripe first, then delete it.' }
    }

    // The agreement points at the order, so it goes first; signatures and order items before their parents
    await prisma.$transaction(async (tx) => {
      await tx.adoptionAgreementSignature.deleteMany({ where: { agreementId: id } })
      await tx.adoptionAgreement.delete({ where: { id } })

      if (order) {
        await tx.orderItem.deleteMany({ where: { orderId: order.id } })
        await tx.order.delete({ where: { id: order.id } })
      }
    })

    await createLog('warn', 'Adoption agreement deleted', {
      agreementId: id,
      dogName: agreement.dogName,
      adopterEmail: agreement.email,
      status: agreement.status,
      orderId: order?.id ?? null,
      amount: order ? Number(order.totalAmount) : null,
      deletedBy: gate.userId
    })

    revalidatePath('/admin/adoption-agreements')
    revalidatePath('/admin/transactions')

    return { success: true, data: { id } }
  } catch (error) {
    await createLog('error', 'Failed to delete adoption agreement', { agreementId: id, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to delete the agreement. Please try again.' }
  }
}
