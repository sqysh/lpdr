import { Order, OrderItem } from '@prisma/client'
import {
  orderConfirmationTemplate,
  getOrderEmailSubject
} from 'lib/email/templates/order-confirmation.template'
import { resend } from 'lib/email/resend'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'

type OrderWithItems = Order & { items: OrderItem[] }

export default async function sendConfirmationEmail(order: OrderWithItems) {
  try {
    await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL}>`,
      to: order.customerEmail,
      subject: getOrderEmailSubject(order),
      html: orderConfirmationTemplate(order)
    })
  } catch (error) {
    await createLog('error', 'Failed to send order confirmation email', {
      orderId: order.id,
      email: order.customerEmail,
      error: getErrorMessage(error)
    })
  }
}
