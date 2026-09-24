'use server'

import prisma from 'prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { findOwnedAgreement } from 'lib/adoption-agreement/agreement-access'
import type { ActionResult } from 'types/action.types'

export type DevAgreementStep = 'details' | 'terms' | 'financial' | 'payment' | 'done'

/**
 * Development only. Puts an agreement back at the start of a step by removing what later steps
 * recorded, so each step can be tested again without drafting a new agreement.
 */
export async function devSetAgreementStep(agreementId: string, step: DevAgreementStep): Promise<ActionResult<null>> {
  // Vercel previews also run as production, so this can only ever act on a local dev server
  if (process.env.NODE_ENV === 'production') return { success: false, data: null, error: 'Not available' }

  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const agreement = await findOwnedAgreement(agreementId, gate.userId)
  if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

  // Payment fields are cleared for every step before payment, so a reset never looks paid
  const unpaid = { paidAt: null, orderId: null, markedPaidById: null }

  await prisma.$transaction(async (tx) => {
    if (step === 'details' || step === 'terms') {
      await tx.adoptionAgreementSignature.deleteMany({ where: { agreementId } })
      // The details step shows while anything is missing, so clearing the phone brings it back
      await tx.adoptionAgreement.update({
        where: { id: agreementId },
        data: { status: 'SENT', ...unpaid, ...(step === 'details' && { phone: null }) }
      })
    }

    if (step === 'financial') {
      await tx.adoptionAgreementSignature.deleteMany({ where: { agreementId, role: { not: 'TERMS_ADOPTER' } } })
      await tx.adoptionAgreement.update({ where: { id: agreementId }, data: { status: 'SENT', ...unpaid } })
    }

    if (step === 'payment') {
      await tx.adoptionAgreementSignature.deleteMany({ where: { agreementId, role: 'REPRESENTATIVE' } })
      await tx.adoptionAgreement.update({ where: { id: agreementId }, data: { status: 'SIGNED', ...unpaid } })
    }

    if (step === 'done') {
      await tx.adoptionAgreement.update({ where: { id: agreementId }, data: { status: 'PAID', paidAt: new Date() } })
    }
  })

  return { success: true, data: null }
}
