import prisma from 'prisma/client'
import { AdminOrdersClient } from './AdminOrdersClient'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    where: { source: 'SITE' },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        select: { quantity: true }
      }
    }
  })

  const serialized = orders.map((o) => ({
    id: o.id,
    userId: o.userId,
    type: o.type,
    status: o.status,
    shippingStatus: o.shippingStatus,
    totalAmount: Number(o.totalAmount),
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    isRecurring: o.isRecurring,
    recurringFrequency: o.recurringFrequency ?? null,
    tierName: o.tierName ?? null,
    stripeSubscriptionId: o.stripeSubscriptionId ?? null,
    itemCount: o.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
    createdAt: o.createdAt.toISOString()
  }))

  return <AdminOrdersClient orders={serialized} />
}
