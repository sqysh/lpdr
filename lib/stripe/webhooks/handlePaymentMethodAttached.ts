import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import prisma from 'prisma/client'
import Stripe from 'stripe'
import { getErrorMessage } from 'app/utils/_error.utils'

export async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    const customerId =
      typeof paymentMethod.customer === 'string'
        ? paymentMethod.customer
        : paymentMethod.customer?.id

    if (!customerId) return

    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) return

    const existing = await prisma.paymentMethod.findUnique({
      where: { stripePaymentId: paymentMethod.id }
    })

    if (existing) return

    const hasDefault = await prisma.paymentMethod.findFirst({
      where: { userId: user.id, isDefault: true }
    })

    await prisma.paymentMethod.create({
      data: {
        stripePaymentId: paymentMethod.id,
        cardholderName: paymentMethod.billing_details?.name || 'Unknown',
        cardBrand: paymentMethod.card?.brand || 'unknown',
        cardLast4: paymentMethod.card?.last4 || '0000',
        cardExpMonth: paymentMethod.card?.exp_month || 0,
        cardExpYear: paymentMethod.card?.exp_year || 0,
        isDefault: !hasDefault,
        userId: user.id
      }
    })

    await createLog('info', 'Payment method attached via webhook', {
      paymentMethodId: paymentMethod.id,
      userId: user.id,
      isDefault: !hasDefault
    })

    await pusherSuperuser('payment-method-attached', {
      userId: user.id,
      email: user.email,
      brand: paymentMethod.card?.brand,
      last4: paymentMethod.card?.last4
    })
  } catch (error) {
    await createLog('error', 'Error handling payment method attached', {
      error: getErrorMessage(error),
      paymentMethodId: paymentMethod.id
    })
  }
}
