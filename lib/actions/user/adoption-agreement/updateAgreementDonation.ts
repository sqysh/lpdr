'use server'

import prisma from 'prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { updateAgreementDonationSchema } from 'lib/schemas/adoption-agreement.schema'
import { findOwnedAgreement } from 'lib/adoption-agreement/agreement-access'
import type { ActionResult } from 'types/action.types'

// The donation is a voluntary gift on top of the agreed fees, so it can change right up until payment
export async function updateAgreementDonation(input: unknown): Promise<ActionResult<null>> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(updateAgreementDonationSchema, input)
  if (parsed.ok === false) return parsed.result

  const { agreementId, additionalDonation } = parsed.data

  try {
    const agreement = await findOwnedAgreement(agreementId, gate.userId)
    if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

    // SIGNED in the where, so it can't change once a payment has gone through
    const { count } = await prisma.adoptionAgreement.updateMany({
      where: { id: agreementId, status: 'SIGNED' },
      data: { additionalDonation }
    })

    if (count === 0) return { success: false, data: null, error: 'This adoption has already been paid for.' }

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update adoption agreement donation', { agreementId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to update your donation. Please try again.' }
  }
}
