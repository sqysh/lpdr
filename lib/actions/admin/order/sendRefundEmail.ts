'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { resend } from 'lib/email/resend'
import { refundTemplate } from 'lib/email/templates/refund.template'
import { REFUND_REASONS, type RefundReason } from 'lib/constants/refund.constants'

export async function sendRefundEmail(orderId: string, reason: RefundReason) {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  if (!(reason in REFUND_REASONS)) return { success: false, data: null, error: 'Unknown reason' }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, customerEmail: true, customerName: true, totalAmount: true, status: true, refundEmailSentAt: true }
    })

    if (!order) return { success: false, data: null, error: 'Order not found' }
    if (!order.customerEmail) return { success: false, data: null, error: 'This order has no email address on it' }

    // The button hides once sent, so reaching here twice means two admins had the page open.
    if (order.refundEmailSentAt) {
      return { success: false, data: null, error: 'A refund email has already been sent for this order' }
    }

    await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: order.customerEmail,
      subject: 'Your refund from Little Paws Dachshund Rescue',
      html: refundTemplate({
        firstName: order.customerName?.split(' ')[0] || 'there',
        amount: Number(order.totalAmount),
        reason
      })
    })

    // Written after the send, so a failed send leaves the button available to try again.
    await prisma.order.update({ where: { id: orderId }, data: { refundEmailSentAt: new Date() } })

    await createLog('info', 'Refund email sent', { orderId, reason, sentBy: gate.userId, to: order.customerEmail })

    return { success: true, data: null, error: null }
  } catch (error) {
    await createLog('error', 'Failed to send refund email', { orderId, reason, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Could not send the email. Please try again.' }
  }
}
