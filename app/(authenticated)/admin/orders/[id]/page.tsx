import { notFound } from 'next/navigation'
import prisma from 'prisma/client'
import { AdminOrderDetailsClient } from './AdminOrderDetailsClient'
import { SerializedOrder, SerializedSubscriptionOrder } from 'types/order.types'

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: 'asc' } },
      user: { select: { id: true, email: true, firstName: true, lastName: true } }
    }
  })

  if (!order) notFound()

  // Fetch all orders for this subscription if recurring
  const subscriptionOrders = order.stripeSubscriptionId
    ? await prisma.order.findMany({
        where: { stripeSubscriptionId: order.stripeSubscriptionId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          paymentIntentId: true,
          failureCode: true,
          failureReason: true,
          isFirstPayment: true,
          nextBillingDate: true
        }
      })
    : []

  const serialized: SerializedOrder = {
    ...order,
    totalAmount: Number(order.totalAmount),
    feesCovered: Number(order.feesCovered ?? 0),
    isRecurring: order.isRecurring,
    recurringFrequency: order.recurringFrequency ?? null,
    tierName: order.tierName ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    nextBillingDate: order.nextBillingDate ? order.nextBillingDate.toISOString() : null,
    failureEmailSentAt: order.failureEmailSentAt ? order.failureEmailSentAt.toISOString() : null,
    items: order.items.map((i) => ({
      ...i,
      price: Number(i.price),
      shippingPrice: Number(i.shippingPrice),
      subtotal: i.subtotal != null ? Number(i.subtotal) : null,
      totalPrice: i.totalPrice != null ? Number(i.totalPrice) : null,
      welcomeWienerId: i.welcomeWienerId ?? null,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString()
    }))
  }

  const serializedSubscriptionOrders: SerializedSubscriptionOrder[] = subscriptionOrders.map((o) => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt.toISOString()
  }))

  return <AdminOrderDetailsClient order={serialized} subscriptionOrders={serializedSubscriptionOrders} />
}
