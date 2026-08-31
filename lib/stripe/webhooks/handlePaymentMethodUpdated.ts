import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import prisma from 'prisma/client'
import Stripe from 'stripe'

export async function handlePaymentMethodUpdated(paymentMethod: Stripe.PaymentMethod) {
  try {
    if (!paymentMethod.customer) return

    const existing = await prisma.paymentMethod.findFirst({
      where: { stripePaymentId: paymentMethod.id },
      select: {
        user: {
          select: { id: true, email: true, firstName: true }
        }
      }
    })

    await prisma.paymentMethod.update({
      where: { stripePaymentId: paymentMethod.id },
      data: {
        cardBrand: paymentMethod.card?.brand || 'unknown',
        cardLast4: paymentMethod.card?.last4 || '0000',
        cardExpMonth: paymentMethod.card?.exp_month || 0,
        cardExpYear: paymentMethod.card?.exp_year || 0
      }
    })

    await createLog('info', 'Payment method updated', {
      paymentMethodId: paymentMethod.id,
      customerId:
        typeof paymentMethod.customer === 'string'
          ? paymentMethod.customer
          : paymentMethod.customer?.id
    })

    await pusherSuperuser('payment-method-updated', {
      userId: existing?.user.id ?? null,
      email: existing?.user.email ?? null,
      name: existing?.user.firstName ?? null,
      brand: paymentMethod.card?.brand ?? null,
      last4: paymentMethod.card?.last4 ?? null
    })
  } catch (error) {
    await createLog('error', 'Error updating payment method', {
      paymentMethodId: paymentMethod.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
