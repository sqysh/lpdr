import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import prisma from 'prisma/client'
import Stripe from 'stripe'

export async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  try {
    // Fetch before deleting so we have user info for the superuser event
    const existing = await prisma.paymentMethod.findFirst({
      where: { stripePaymentId: paymentMethod.id },
      select: {
        user: {
          select: { id: true, email: true, firstName: true }
        }
      }
    })

    await prisma.paymentMethod.deleteMany({
      where: { stripePaymentId: paymentMethod.id }
    })

    await createLog('info', 'Payment method detached', {
      paymentMethodId: paymentMethod.id
    })

    await pusherSuperuser('payment-method-detached', {
      userId: existing?.user.id ?? null,
      email: existing?.user.email ?? null,
      name: existing?.user.firstName ?? null,
      brand: paymentMethod.card?.brand ?? null,
      last4: paymentMethod.card?.last4 ?? null
    })
  } catch (error) {
    await createLog('error', 'Error handling payment method detach', {
      paymentMethodId: paymentMethod.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
