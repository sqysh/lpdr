import { stripeClient } from 'lib/stripe/stripe-client'
import prisma from 'prisma/client'

export async function getOrCreateStripeCustomer({
  userId,
  email
}: {
  userId?: string
  email: string
}): Promise<string> {
  // 1 ── stored id: the fast path every call after the first takes
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    })
    if (user?.stripeCustomerId) return user.stripeCustomerId
  }

  // 2 ── existing Stripe customer by email (list is consistent; search lags)
  const existing = await stripeClient.customers.list({ email, limit: 1 })
  let customerId = existing.data[0]?.id

  // 3 ── create if truly new
  if (!customerId) {
    const customer = await stripeClient.customers.create({
      email,
      metadata: { userId: userId ?? '' }
    })
    customerId = customer.id
  }

  // 4 ── persist so step 1 short-circuits forever after
  if (userId) {
    await prisma.user
      .update({ where: { id: userId }, data: { stripeCustomerId: customerId } })
      .catch(() => {}) // best-effort; worst case is one extra Stripe lookup next time
  }

  return customerId
}
