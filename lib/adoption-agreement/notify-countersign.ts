import 'server-only'
import prisma from 'prisma/client'
import { resend } from 'lib/email/resend'
import { createLog } from 'lib/actions/log/createLog'
import { COLOR } from 'lib/constants/order-confirmation-constants'
import { escapeHtml } from 'lib/utils/html.utils'
import { getErrorMessage } from 'lib/utils/error.utils'

const SITE = process.env.NEXT_PUBLIC_SITE_URL

/**
 * Tells the admin who prepared an agreement that it's paid and waiting for their countersignature.
 * Best effort: the payment is recorded either way, so a failure is logged, never thrown.
 */
export async function notifyAwaitingCountersign(agreementId: string, { skipUserId }: { skipUserId?: string } = {}) {
  try {
    const a = await prisma.adoptionAgreement.findUnique({
      where: { id: agreementId },
      select: { dogName: true, firstName: true, lastName: true, createdById: true, createdBy: { select: { email: true, firstName: true } } }
    })

    // Whoever recorded the payment themselves already knows it's waiting on them
    if (!a || !SITE || a.createdById === skipUserId) return

    const dog = escapeHtml(a.dogName)
    const adopter = escapeHtml([a.firstName, a.lastName].filter(Boolean).join(' '))
    const link = `${SITE}/admin/adoption-agreements/${agreementId}`

    const { error } = await resend.emails.send({
      from: 'Little Paws Dachshund Rescue <adoptions@littlepawsdr.org>',
      to: a.createdBy.email,
      subject: `Ready to countersign: ${a.dogName}`,
      html: `
        <div style="max-width: 520px; margin: 0 auto; padding: 32px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
          <p style="margin: 0 0 24px 0; color: ${COLOR.accent}; font-size: 10px; font-family: 'Courier New', monospace; letter-spacing: 0.2em; text-transform: uppercase;">Adoption agreement</p>
          <h1 style="margin: 0 0 12px 0; color: ${COLOR.heading}; font-size: 22px;">${dog} is ready for your signature</h1>
          <p style="margin: 0 0 28px 0; color: ${COLOR.body}; font-size: 15px; line-height: 1.7;">
            ${adopter} has signed and paid. Countersign the agreement to complete the adoption, and they'll get their copy by email.
          </p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background: ${COLOR.accent}; color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;">Open agreement</a>
        </div>`
    })

    if (error) throw new Error(error.message)
  } catch (error) {
    await createLog('error', 'Countersign notification failed to send', { agreementId, error: getErrorMessage(error) })
  }
}
