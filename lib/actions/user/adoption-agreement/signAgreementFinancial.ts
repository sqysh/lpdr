'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { signFinancialSchema } from 'lib/schemas/adoption-agreement.schema'
import { changedSince, findOwnedAgreement, getSigningContext, hasSigned } from 'lib/adoption-agreement/agreement-access'
import type { ActionResult } from 'types/action.types'
import { createLog } from 'lib/actions/log/createLog'
import { OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'
import { resend } from 'lib/email/resend'
import { agreementTotal } from 'lib/utils/adoption-agreement.utils'
import { adoptionAgreementPaymentTemplate } from 'lib/email/templates/adoption-agreement-payment.template'

const SITE = process.env.NEXT_PUBLIC_SITE_URL

export async function signAgreementFinancial(input: unknown): Promise<ActionResult<{ paysByCard: boolean }>> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(signFinancialSchema, input)
  if (parsed.ok === false) return parsed.result

  const { agreementId, loadedAt, firstAdopterName, secondAdopterName, additionalDonation } = parsed.data

  try {
    const agreement = await findOwnedAgreement(agreementId, gate.userId)
    if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

    if (!hasSigned(agreement.signatures, 'TERMS_ADOPTER')) {
      return { success: false, data: null, error: 'Please sign the terms first.' }
    }

    if (changedSince(agreement.updatedAt, loadedAt)) {
      return { success: false, data: null, error: 'This agreement was just updated. Please review the changes before signing.' }
    }

    const context = await getSigningContext()

    // Signatures and the status move together: an agreement is never SIGNED with a signature missing.
    // SENT in the where means a second submit matches nothing, so update throws P2025 and nothing is written
    await prisma.$transaction(async (tx) => {
      await tx.adoptionAgreement.update({
        where: { id: agreementId, status: 'SENT' },
        data: { status: 'SIGNED', additionalDonation },
        select: { id: true }
      })

      await tx.adoptionAgreementSignature.create({
        data: { agreementId, role: 'FINANCIAL_FIRST_ADOPTER', typedName: firstAdopterName, ...context }
      })

      if (secondAdopterName) {
        await tx.adoptionAgreementSignature.create({
          data: { agreementId, role: 'FINANCIAL_SECOND_ADOPTER', typedName: secondAdopterName, ...context }
        })
      }
    })

    const paysByCard = agreement.paymentMethod === 'CARD'

    // Card payers go straight to the payment step. Everyone else needs the details somewhere they
    // can find again, not just on a page they might close
    if (agreement.paymentMethod !== 'CARD') {
      if (!SITE) {
        await createLog('error', 'NEXT_PUBLIC_SITE_URL is not set; payment instructions not emailed', { agreementId })
      } else {
        const { label, instruction } = OFFLINE_PAYMENT_INSTRUCTIONS[agreement.paymentMethod]
        const total = agreementTotal({
          adoptionFee: Number(agreement.adoptionFee),
          healthCertificateFee: agreement.healthCertificateFee == null ? null : Number(agreement.healthCertificateFee),
          additionalDonation
        })

        try {
          const { error } = await resend.emails.send({
            from: 'Little Paws Dachshund Rescue <adoptions@littlepawsdr.org>',
            to: agreement.email,
            replyTo: 'applications@littlepawsdr.org',
            subject: `How to pay for ${agreement.dogName}'s adoption`,
            html: adoptionAgreementPaymentTemplate({
              firstName: agreement.firstName,
              dogName: agreement.dogName,
              total,
              methodLabel: label,
              instruction,
              link: `${SITE}/adopt/agreement/${agreementId}`
            })
          })
          if (error) throw new Error(error.message)
        } catch (error) {
          await createLog('error', 'Adoption payment instructions email failed to send', { agreementId, error: getErrorMessage(error) })
        }
      }
    }

    const payload = {
      agreementId,
      dogName: agreement.dogName,
      adopterEmail: agreement.email,
      paymentMethod: agreement.paymentMethod,
      additionalDonation
    }

    await Promise.all([
      createLog('info', 'Adoption agreement signed', payload),
      pusherSuperuser('adoption-agreement-signed', payload).catch(() => {})
    ])

    return { success: true, data: { paysByCard } }
  } catch (error) {
    // P2025: not SENT anymore, so already signed. P2002: the signature exists, the unique index backstop
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2025' || error.code === 'P2002')) {
      return { success: false, data: null, error: 'This agreement has already been signed.' }
    }

    await createLog('error', 'Failed to sign adoption agreement', { agreementId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to record your signatures. Please try again.' }
  }
}
