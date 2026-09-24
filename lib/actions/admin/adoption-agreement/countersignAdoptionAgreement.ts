'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { resend } from 'lib/email/resend'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { countersignAgreementSchema } from 'lib/schemas/adoption-agreement.schema'
import { getSigningContext } from 'lib/adoption-agreement/agreement-access'
import { adoptionAgreementCompleteTemplate } from 'lib/email/templates/adoption-agreement-complete.template'
import type { ActionResult } from 'types/action.types'

const SITE = process.env.NEXT_PUBLIC_SITE_URL

export async function countersignAdoptionAgreement(input: unknown): Promise<ActionResult<null>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(countersignAgreementSchema, input)
  if (parsed.ok === false) return parsed.result

  const { agreementId, typedName } = parsed.data

  if (!SITE) {
    await createLog('error', 'NEXT_PUBLIC_SITE_URL is not set; adoption agreement not countersigned', { agreementId })
    return { success: false, data: null, error: 'The site address is not configured.' }
  }

  try {
    const context = await getSigningContext()

    const agreement = await prisma.$transaction(async (tx) => {
      // PAID in the where: if it's already complete, update throws P2025 and nothing is written
      const updated = await tx.adoptionAgreement.update({
        where: { id: agreementId, status: 'PAID' },
        data: { status: 'COMPLETE' },
        select: { dogName: true, email: true, firstName: true }
      })

      await tx.adoptionAgreementSignature.create({ data: { agreementId, role: 'REPRESENTATIVE', typedName, ...context } })

      return updated
    })

    // The adoption is complete whether or not this email goes out, so a failure is logged rather than undone
    try {
      const { error } = await resend.emails.send({
        from: 'Little Paws Dachshund Rescue <adoptions@littlepawsdr.org>',
        to: agreement.email,
        replyTo: 'applications@littlepawsdr.org',
        subject: `Your adoption of ${agreement.dogName} is complete`,
        html: adoptionAgreementCompleteTemplate({
          firstName: agreement.firstName,
          dogName: agreement.dogName,
          link: `${SITE}/adopt/agreement/${agreementId}`
        })
      })
      if (error) throw new Error(error.message)
    } catch (error) {
      await createLog('error', 'Adoption complete email failed to send', {
        agreementId,
        dogName: agreement.dogName,
        error: getErrorMessage(error)
      })
    }

    const payload = { agreementId, dogName: agreement.dogName, adopterEmail: agreement.email, countersignedBy: gate.userId }

    await Promise.all([
      createLog('info', 'Adoption agreement countersigned', payload),
      pusherSuperuser('adoption-agreement-completed', payload).catch(() => {})
    ])

    return { success: true, data: null }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2025' || error.code === 'P2002')) {
      return { success: false, data: null, error: 'This agreement is not waiting for a countersignature.' }
    }

    await createLog('error', 'Failed to countersign adoption agreement', { agreementId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to countersign the agreement. Please try again.' }
  }
}
