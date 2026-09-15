import { notFound } from 'next/navigation'
import prisma from 'prisma/client'
import { AdminOrderDetailsClient } from './AdminOrderDetailsClient'
import { serialize } from 'lib/utils/serializers.utils'

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: 'asc' } },
      user: { select: { id: true, email: true, firstName: true, lastName: true, anonymousBidding: true } }
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

  return <AdminOrderDetailsClient order={serialize(order)} subscriptionOrders={serialize(subscriptionOrders)} />
}
