import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import Stripe from 'stripe'

export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const item = subscription.items.data[0]
    const currentPeriodEnd = item ? new Date(item.current_period_end * 1000) : null

    await createLog('info', 'Stripe subscription created', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
      frequency: subscription.metadata?.frequency || 'MONTHLY',
      amount: item?.price.unit_amount ?? 0,
      customerEmail: subscription.metadata?.email,
      campaignId: subscription.metadata?.campaignId,
      currentPeriodEnd,
      createdAt: new Date(subscription.created * 1000)
    })

    await pusherSuperuser('subscription-created', {
      email: subscription.metadata?.email ?? null,
      status: subscription.status,
      frequency: subscription.metadata?.frequency ?? 'MONTHLY',
      amount: subscription.items.data[0]?.price.unit_amount ?? 0,
      stripeSubscriptionId: subscription.id
    })
  } catch (error) {
    await createLog('error', 'Failed to log subscription creation', {
      subscriptionId: subscription.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
