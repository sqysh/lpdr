import { Memorial, Order } from '@prisma/client'
import { memorialReviewTemplate } from 'lib/email/templates/memorial-review.template'
import { resend } from 'lib/email/resend'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { formatMoney } from 'lib/utils/currency.utils'

const REVIEW_INBOX = process.env.MEMORIAL_REVIEW_EMAIL ?? 'lpdr@littlepawsdr.org'

export default async function sendMemorialReviewEmail(memorial: Memorial, order: Order, siteUrl: string) {
  try {
    const email = memorialReviewTemplate({
      siteUrl,
      memorialId: memorial.id,
      dogName: memorial.dogName,
      message: memorial.message,
      photoUrl: memorial.photoUrl,
      donorName: order.customerName ?? 'Unknown donor',
      donorEmail: order.customerEmail ?? '',
      displayName: memorial.showDonorName ? memorial.donorDisplayName : null,
      amount: formatMoney(Number(order.totalAmount))
    })

    const result = await resend.emails.send({
      from: `Little Paws Dachshund Rescue <memorials@littlepawsdr.org>`,
      to: REVIEW_INBOX,
      subject: email.subject,
      html: email.html,
      text: email.text
    })

    if (result.error || !result.data?.id) {
      throw new Error(result.error?.message ?? 'Resend returned no message id')
    }

    await createLog('info', 'Memorial review email sent', {
      location: ['sendMemorialReviewEmail.ts'],
      memorialId: memorial.id,
      messageId: result.data.id
    })
  } catch (error) {
    await createLog('error', 'Failed to send memorial review email', {
      location: ['sendMemorialReviewEmail.ts'],
      memorialId: memorial.id,
      error: getErrorMessage(error)
    })
  }
}
