import { notFound } from 'next/navigation'
import prisma from 'prisma/client'
import { AdminTransactionDetailsClient } from './AdminTransactionDetailsClient'
import { serialize } from 'lib/utils/serializers.utils'
import { orderDetailArgs, subscriptionOrderArgs } from 'types/order.types'

export default async function AdminTransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findUnique({ where: { id }, ...orderDetailArgs })
  if (!order) notFound()

  // Every payment in the subscription, for the history panel
  const subscriptionOrders = order.stripeSubscriptionId
    ? await prisma.order.findMany({
        where: { stripeSubscriptionId: order.stripeSubscriptionId },
        orderBy: { createdAt: 'desc' },
        ...subscriptionOrderArgs
      })
    : []

  return <AdminTransactionDetailsClient order={serialize(order)} subscriptionOrders={serialize(subscriptionOrders)} />
}
