'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { signTermsSchema } from 'lib/schemas/adoption-agreement.schema'
import { ADOPTION_TERMS_VERSION } from 'lib/constants/adoption-agreement.constants'
import { changedSince, findOwnedAgreement, getSigningContext, hasSigned } from 'lib/adoption-agreement/agreement-access'
import type { ActionResult } from 'types/action.types'

export async function signAgreementTerms(input: unknown): Promise<ActionResult<{ updatedAt: string }>> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(signTermsSchema, input)
  if (parsed.ok === false) return parsed.result

  const { agreementId, loadedAt, typedName } = parsed.data

  try {
    const agreement = await findOwnedAgreement(agreementId, gate.userId)
    if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

    if (agreement.status !== 'SENT' || hasSigned(agreement.signatures, 'TERMS_ADOPTER')) {
      return { success: false, data: null, error: 'The terms have already been signed.' }
    }

    if (!agreement.firstName || !agreement.lastName || !agreement.addressLine1 || !agreement.state) {
      return { success: false, data: null, error: 'Please confirm your name and address first.' }
    }

    if (changedSince(agreement.updatedAt, loadedAt)) {
      return { success: false, data: null, error: 'This agreement was just updated. Please review the changes before signing.' }
    }

    const context = await getSigningContext()

    // The version is stamped here rather than at drafting, so it always matches the text that was on screen
    const [, updated] = await prisma.$transaction([
      prisma.adoptionAgreementSignature.create({ data: { agreementId, role: 'TERMS_ADOPTER', typedName, ...context } }),
      prisma.adoptionAgreement.update({
        where: { id: agreementId },
        data: { termsVersion: ADOPTION_TERMS_VERSION },
        select: { updatedAt: true }
      })
    ])

    const payload = { agreementId, dogName: agreement.dogName, adopterEmail: agreement.email }

    await Promise.all([
      createLog('info', 'Adoption agreement terms signed', payload),
      pusherSuperuser('adoption-agreement-terms-signed', payload).catch(() => {})
    ])

    return { success: true, data: { updatedAt: updated.updatedAt.toISOString() } }
  } catch (error) {
    // The unique index on (agreement, role) is the backstop for a double submit
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, data: null, error: 'The terms have already been signed.' }
    }

    await createLog('error', 'Failed to sign adoption agreement terms', { agreementId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to record your signature. Please try again.' }
  }
}
