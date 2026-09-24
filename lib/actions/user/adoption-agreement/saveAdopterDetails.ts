'use server'

import prisma from 'prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { adopterDetailsSchema } from 'lib/schemas/adoption-agreement.schema'
import { findOwnedAgreement, hasSigned } from 'lib/adoption-agreement/agreement-access'
import type { ActionResult } from 'types/action.types'

export async function saveAdopterDetails(agreementId: string, input: unknown): Promise<ActionResult<{ updatedAt: string }>> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(adopterDetailsSchema, input)
  if (parsed.ok === false) return parsed.result

  try {
    const agreement = await findOwnedAgreement(agreementId, gate.userId)
    if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

    // The terms name the adopter and their state, so these are fixed once the terms are signed
    if (agreement.status !== 'SENT' || hasSigned(agreement.signatures, 'TERMS_ADOPTER')) {
      return { success: false, data: null, error: 'Your details are locked once you sign the terms.' }
    }

    const d = parsed.data
    const address = {
      addressLine1: d.addressLine1,
      addressLine2: d.addressLine2,
      city: d.city,
      state: d.state,
      zipPostalCode: d.zipPostalCode
    }

    // Saved to the account as well, so the adopter isn't asked for them again at their next checkout
    const [updated] = await prisma.$transaction([
      prisma.adoptionAgreement.update({
        where: { id: agreementId },
        data: { firstName: d.firstName, lastName: d.lastName, phone: d.phone, ...address },
        select: { updatedAt: true }
      }),
      prisma.user.update({ where: { id: gate.userId }, data: { firstName: d.firstName, lastName: d.lastName, phone: d.phone } }),
      prisma.address.upsert({
        where: { userId: gate.userId },
        create: { userId: gate.userId, name: `${d.firstName} ${d.lastName}`, ...address },
        update: { name: `${d.firstName} ${d.lastName}`, ...address }
      })
    ])

    return { success: true, data: { updatedAt: updated.updatedAt.toISOString() } }
  } catch (error) {
    await createLog('error', 'Failed to save adopter details', { agreementId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to save your details. Please try again.' }
  }
}
