import { createLog } from 'lib/actions/log/createLog'
import { resend } from 'lib/email/resend'
import { throttled } from 'lib/email/throttled'
import { adminOrderNotificationTemplate } from 'lib/email/templates/admin-order-notification.template'

type ShippableOrder = {
  id: string
  customerName: string
  customerEmail: string
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zipPostalCode: string | null
  items: { itemName: string; quantity: number }[]
}

/** Tells the rescue a paid order needs posting. Best effort: the order is recorded either way */
export async function sendAdminShippingNotice(order: ShippableOrder) {
  try {
    const { error } = await throttled(() =>
      resend.emails.send({
        from: 'Little Paws Dachshund Rescue <orders@littlepawsdr.org>',
        to: 'lpdr@littlepawsdr.org',
        subject: `New order to ship: #${order.id.slice(-8).toUpperCase()}`,
        html: adminOrderNotificationTemplate({
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          items: order.items.map((i) => ({ name: i.itemName, quantity: i.quantity })),
          addressLine1: order.addressLine1,
          addressLine2: order.addressLine2,
          city: order.city,
          state: order.state,
          zipPostalCode: order.zipPostalCode
        })
      })
    )
    // Resend reports rejections in the result rather than throwing
    if (error) throw new Error(error.message)
  } catch (error) {
    await createLog('error', 'Failed to send admin shipping notification', {
      orderId: order.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
