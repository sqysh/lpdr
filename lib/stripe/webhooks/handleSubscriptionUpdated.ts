import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser, pusherTrigger } from 'lib/pusher/pusher.utils'
import prisma from 'prisma/client'
import Stripe from 'stripe'

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const latestOrder = await prisma.order.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true } }
      }
    })

    if (!latestOrder) return

    const isCancellingAtPeriodEnd = subscription.cancel_at_period_end

    const order = await prisma.order.update({
      where: { id: latestOrder.id },
      data: {
        status: isCancellingAtPeriodEnd ? 'CANCELLED' : latestOrder.status,
        nextBillingDate:
          isCancellingAtPeriodEnd && subscription.cancel_at
            ? new Date((subscription as any).cancel_at * 1000)
            : (subscription as any).current_period_end
              ? new Date((subscription as any).current_period_end * 1000)
              : null
      }
    })

    await createLog(
      'info',
      isCancellingAtPeriodEnd ? 'Subscription scheduled for cancellation' : 'Subscription updated',
      {
        subscriptionId: subscription.id,
        orderId: order.id,
        status: subscription.status,
        cancelAtPeriodEnd: isCancellingAtPeriodEnd
      }
    )

    if (order?.userId) {
      await pusherTrigger(`user-${order.userId}`, 'subscription-updated', {
        subscriptionId: subscription.id,
        status: order.status,
        cancelAtPeriodEnd: isCancellingAtPeriodEnd,
        nextBillingDate: order.nextBillingDate
      })
    }

    await pusherSuperuser('subscription-updated', {
      userId: latestOrder.user?.id ?? null,
      email: latestOrder.user?.email ?? null,
      name: latestOrder.user?.firstName ?? null,
      stripeSubscriptionId: subscription.id,
      status: isCancellingAtPeriodEnd ? 'CANCELLING' : subscription.status,
      cancelAtPeriodEnd: isCancellingAtPeriodEnd
    })
  } catch (error) {
    await createLog('error', 'Error updating subscription', {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
