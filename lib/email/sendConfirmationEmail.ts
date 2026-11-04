import { MemorialStatus, Order, OrderItem } from '@prisma/client'
import { orderConfirmationTemplate, getOrderEmailSubject } from 'lib/email/templates/order-confirmation.template'
import { resend } from 'lib/email/resend'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'

type OrderWithItems = Order & {
  items: OrderItem[]
  memorial?: { id: string; dogName: string; status: MemorialStatus } | null
}

export default async function sendConfirmationEmail(order: OrderWithItems) {
  try {
    const result = await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL}>`,
      to: order.customerEmail,
      subject: getOrderEmailSubject(order),
      html: orderConfirmationTemplate(order)
    })

    if (result.error || !result.data?.id) {
      throw new Error(result.error?.message ?? 'Resend returned no message id')
    }

    await createLog('info', 'Order confirmation sent', {
      location: ['sendConfirmationEmail.ts'],
      orderId: order.id,
      messageId: result.data.id
    })
  } catch (error) {
    await createLog('error', 'Failed to send order confirmation email', {
      location: ['sendConfirmationEmail.ts'],
      orderId: order.id,
      email: order.customerEmail,
      error: getErrorMessage(error)
    })
  }
}
