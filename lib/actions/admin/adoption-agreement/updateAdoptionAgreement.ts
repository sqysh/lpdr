'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { updateAdoptionAgreementSchema } from 'lib/schemas/adoption-agreement.schema'
import type { ActionResult } from 'types/action.types'

// Once the adopter signs, the details are what they agreed to, so edits stop there
const EDITABLE_STATUSES = ['DRAFT', 'SENT'] as const

export async function updateAdoptionAgreement(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  if (!id) return { success: false, data: null, error: 'Missing agreement' }

  const parsed = parseInput(updateAdoptionAgreementSchema, input)
  if (parsed.ok === false) return parsed.result

  try {
    const before = await prisma.adoptionAgreement.findUnique({
      where: { id },
      select: { status: true, dogName: true }
    })

    if (!before) return { success: false, data: null, error: 'Agreement not found' }

    // Status is checked again inside the write, since the adopter could sign between this read and the
    // update. If they did, nothing is written and the admin is told why
    const { count } = await prisma.adoptionAgreement.updateMany({
      where: { id, status: { in: [...EDITABLE_STATUSES] } },
      data: parsed.data
    })

    if (count === 0) {
      return {
        success: false,
        data: null,
        error:
          'This agreement has already been signed, so it can no longer be edited. Void it and create a new one if something needs to change.'
      }
    }

    const payload = {
      agreementId: id,
      dogName: before.dogName,
      // An edit after sending changes what the adopter is about to sign, so it should stand out
      afterSending: before.status === 'SENT',
      updatedBy: gate.userId
    }

    await Promise.all([
      createLog('info', 'Adoption agreement updated', payload),
      pusherSuperuser('adoption-agreement-updated', payload).catch((error) =>
        createLog('error', 'Failed to push adoption-agreement-updated to super feed', { agreementId: id, error: getErrorMessage(error) })
      )
    ])

    return { success: true, data: { id } }
  } catch (error) {
    await createLog('error', 'Failed to update adoption agreement', { agreementId: id, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to update the agreement. Please try again.' }
  }
}
