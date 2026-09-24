'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { resend } from 'lib/email/resend'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { parseAdoptionFee } from 'lib/utils/adoption-agreement.utils'
import { adoptionAgreementReadyTemplate } from 'lib/email/templates/adoption-agreement-ready.template'
import type { ActionResult } from 'types/action.types'
import { getDachshundById } from 'lib/actions/_rescue-groups/getDachshundById'

const SITE = process.env.NEXT_PUBLIC_SITE_URL

export async function sendAdoptionAgreement(id: string): Promise<ActionResult<{ id: string; resent: boolean }>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  if (!id) return { success: false, data: null, error: 'Missing agreement' }

  // A missing site URL would email a link starting with "undefined" and still report success
  if (!SITE) {
    await createLog('error', 'NEXT_PUBLIC_SITE_URL is not set; adoption agreement not sent', { agreementId: id })
    return { success: false, data: null, error: 'The site address is not configured. The agreement was not sent.' }
  }

  try {
    const agreement = await prisma.adoptionAgreement.findUnique({
      where: { id },
      select: { status: true, dogRescueGroupsId: true, dogName: true, adoptionFee: true, email: true, firstName: true, paymentMethod: true }
    })

    if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

    if (agreement.status !== 'DRAFT' && agreement.status !== 'SENT') {
      return { success: false, data: null, error: 'This agreement has already been signed.' }
    }

    // A resend only emails again. The fee is left alone, since the adopter may already have seen it
    const resent = agreement.status === 'SENT'

    if (!resent) {
      // The draft may have sat for days, so the fee is re-read from RescueGroups at the moment it goes
      // out. If RescueGroups can't be reached, the fee from drafting still stands rather than blocking the send
      const dogResult = await getDachshundById(agreement.dogRescueGroupsId)
      const dog = dogResult.success ? (dogResult.data?.data?.[0]?.attributes ?? null) : null

      let adoptionFee = Number(agreement.adoptionFee)

      if (dog) {
        const current = parseAdoptionFee(dog.adoptionFeeString)

        if (current === null) {
          return {
            success: false,
            data: null,
            error: `${agreement.dogName}'s adoption fee in RescueGroups ("${dog.adoptionFeeString || 'blank'}") isn't an amount. Update it there, then send again.`
          }
        }

        adoptionFee = current
      } else {
        await createLog('warn', 'Sending adoption agreement with the fee from drafting; RescueGroups unavailable', { agreementId: id })
      }

      // DRAFT in the where, so two admins pressing send at once can't both send it
      const { count } = await prisma.adoptionAgreement.updateMany({
        where: { id, status: 'DRAFT' },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          adoptionFee,
          ...(dog && { dogSnapshot: dog as unknown as Prisma.InputJsonValue })
        }
      })

      if (count === 0) return { success: false, data: null, error: 'This agreement was already sent.' }
    } else {
      await prisma.adoptionAgreement.update({ where: { id }, data: { sentAt: new Date() } })
    }

    // Status is already SENT at this point, so a failed email leaves it resendable rather than stuck in draft.
    // Resend returns rejections as { error } rather than throwing, so both are checked
    let emailFailureReason: string | null = null

    try {
      const { error } = await resend.emails.send({
        from: 'Little Paws Dachshund Rescue <adoptions@littlepawsdr.org>',
        to: agreement.email,
        replyTo: 'applications@littlepawsdr.org',
        subject: `Your adoption agreement for ${agreement.dogName} is ready`,
        html: adoptionAgreementReadyTemplate({
          firstName: agreement.firstName,
          dogName: agreement.dogName,
          link: `${SITE}/adopt/agreement/${id}`,
          paysByCard: agreement.paymentMethod === 'CARD'
        })
      })

      if (error) emailFailureReason = error.message
    } catch (error) {
      emailFailureReason = getErrorMessage(error)
    }

    await prisma.adoptionAgreement.update({
      where: { id },
      data: emailFailureReason ? { emailFailedAt: new Date(), emailFailureReason } : { emailFailedAt: null, emailFailureReason: null }
    })

    if (emailFailureReason) {
      await createLog('error', 'Adoption agreement email failed to send', {
        agreementId: id,
        dogName: agreement.dogName,
        reason: emailFailureReason
      })

      return { success: false, data: null, error: `Sent, but the email failed: ${emailFailureReason}` }
    }

    const payload = { agreementId: id, dogName: agreement.dogName, adopterEmail: agreement.email, resent, sentBy: gate.userId }

    await Promise.all([
      createLog('info', resent ? 'Adoption agreement resent' : 'Adoption agreement sent', payload),
      pusherSuperuser('adoption-agreement-sent', payload).catch((error) =>
        createLog('error', 'Failed to push adoption-agreement-sent to super feed', { agreementId: id, error: getErrorMessage(error) })
      )
    ])

    return { success: true, data: { id, resent } }
  } catch (error) {
    await createLog('error', 'Failed to send adoption agreement', { agreementId: id, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to send the agreement. Please try again.' }
  }
}
