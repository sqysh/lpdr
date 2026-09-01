'use server'

import { ShippingStatus } from '@prisma/client'
import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { pusherSuperuser, pusherTrigger } from 'lib/pusher/pusher.utils'
import { resend } from 'lib/email/resend'
import { orderShippedTemplate } from 'lib/email/templates/order-shipped.template'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'app/utils/_error.utils'

export const updateOrderShippingStatus = async ({
  id,
  shippingStatus
}: {
  id: string
  shippingStatus: ShippingStatus
}) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { shippingStatus },
      include: { items: true }
    })

    if (shippingStatus === 'SHIPPED') {
      if (order.userId) {
        await pusherTrigger(`user-${order.userId}`, 'order-shipped', {
          orderId: order.id,
          customerName: order.customerName
        })
      }

      const firstName = order.customerName.split(' ')[0]
      const { error: emailError } = await resend.emails.send({
        from: 'Little Paws Dachshund Rescue <orders@littlepawsdr.org>',
        to: order.customerEmail,
        subject: 'Your order is on its way',
        html: orderShippedTemplate({
          firstName,
          items: order.items.map((item) => ({
            name: item.itemName ?? 'Item',
            quantity: item.quantity ?? undefined
          })),
          addressLine1: order.addressLine1 ?? '',
          addressLine2: order.addressLine2,
          city: order.city ?? '',
          state: order.state ?? '',
          zipPostalCode: order.zipPostalCode ?? ''
        })
      })

      if (emailError) {
        await createLog('error', 'Failed to send shipped email', {
          orderId: id,
          error: emailError.message
        })
      }
    }

    await createLog('info', 'Order shipping status updated', {
      orderId: id,
      shippingStatus,
      customerName: order.customerName,
      updatedBy: gate.userId
    })

    await pusherSuperuser('order-shipped', {
      orderId: id,
      shippingStatus,
      customerName: order.customerName,
      email: order.customerEmail,
      updatedBy: gate.userId
    })

    return { success: true, error: null }
  } catch (error) {
    await createLog('error', 'Failed to update order shipping status', {
      orderId: id,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to update shipping status.', data: null }
  }
}
