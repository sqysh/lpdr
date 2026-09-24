'use server'

import prisma from 'prisma/client'
import { AdoptionAgreementStatus, Prisma } from '@prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { closeAgreementSchema } from 'lib/schemas/adoption-agreement.schema'
import type { ActionResult } from 'types/action.types'

type Close = {
  input: unknown
  from: AdoptionAgreementStatus[]
  to: 'VOID' | 'RETURNED'
  refused: string
  event: string
}

async function close({ input, from, to, refused, event }: Close): Promise<ActionResult<null>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(closeAgreementSchema, input)
  if (parsed.ok === false) return parsed.result

  const { agreementId, reason } = parsed.data

  try {
    // The allowed statuses are in the where, so the check and the change can't be split by a concurrent update
    const agreement = await prisma.adoptionAgreement.update({
      where: { id: agreementId, status: { in: from } },
      data: { status: to, closedAt: new Date(), closedReason: reason, closedById: gate.userId },
      select: { dogName: true, email: true }
    })

    const payload = { agreementId, dogName: agreement.dogName, adopterEmail: agreement.email, reason, closedBy: gate.userId }

    await Promise.all([
      createLog('info', `Adoption agreement ${to === 'VOID' ? 'voided' : 'returned'}`, payload),
      pusherSuperuser(event, payload).catch(() => {})
    ])

    return { success: true, data: null }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return { success: false, data: null, error: refused }
    }

    await createLog('error', `Failed to ${to === 'VOID' ? 'void' : 'return'} adoption agreement`, {
      agreementId,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Something went wrong. Please try again.' }
  }
}

/** Before any money has come in. After that, ending it is a refund, which is a return. */
export async function voidAdoptionAgreement(input: unknown) {
  return close({
    input,
    from: ['DRAFT', 'SENT', 'SIGNED'],
    to: 'VOID',
    refused: 'This agreement has been paid, so it can no longer be cancelled. Mark it as returned instead.',
    event: 'adoption-agreement-voided'
  })
}

/** Once paid, including a dog brought back within the two-week trial. The refund is handled separately. */
export async function returnAdoptionAgreement(input: unknown) {
  return close({
    input,
    from: ['PAID', 'COMPLETE'],
    to: 'RETURNED',
    refused: 'Only a paid or completed adoption can be marked as returned.',
    event: 'adoption-agreement-returned'
  })
}
