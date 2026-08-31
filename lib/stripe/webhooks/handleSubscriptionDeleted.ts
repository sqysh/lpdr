import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser, pusherTrigger } from 'lib/pusher/pusher.utils'
import prisma from 'prisma/client'
import Stripe from 'stripe'

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const latestOrder = await prisma.order.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, firstName: true } }
      }
    })

    // No matching order — this is an orphan/legacy Stripe event (old test data,
    // or a subscription never tracked in our DB). Ignore it silently.
    if (!latestOrder) {
      return
    }

    await createLog('info', 'Recurring donation cancelled', {
      subscriptionId: subscription.id,
      orderId: latestOrder.id,
      userId: latestOrder.userId
    })

    if (latestOrder.userId) {
      await pusherTrigger(`user-${latestOrder.userId}`, 'subscription-cancelled', {
        subscriptionId: subscription.id,
        orderId: latestOrder.id
      })
    }

    await pusherSuperuser('subscription-cancelled', {
      userId: latestOrder.user?.id ?? null,
      email: latestOrder.user?.email ?? null,
      name: latestOrder.user?.firstName ?? null,
      stripeSubscriptionId: subscription.id,
      orderId: latestOrder.id
    })
  } catch (error) {
    await createLog('error', 'Error cancelling recurring donation', {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
