import prisma from 'prisma/client'
import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'

export const getSubscriptionById = async (id: string) => {
  try {
    const gate = await requireAuth()
    if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: gate.userId,
        isRecurring: true
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: true
      }
    })

    if (!order) return { success: false, error: 'Subscription not found.', data: null }

    // Fetch live data from Stripe
    let stripeSubscription = null
    let stripePaymentMethod = null

    if (order.stripeSubscriptionId) {
      stripeSubscription = await stripeClient.subscriptions.retrieve(order.stripeSubscriptionId, {
        expand: ['default_payment_method']
      })
    }

    if (order.paymentMethodId) {
      stripePaymentMethod = await stripeClient.paymentMethods.retrieve(order.paymentMethodId)
    }

    return {
      success: true,
      error: null,
      data: {
        id: order.id,
        status: order.status,
        stripeStatus: stripeSubscription?.status ?? null,
        totalAmount: Number(order.totalAmount),
        feesCovered: Number(order.feesCovered),
        coverFees: order.coverFees,
        recurringFrequency: order.recurringFrequency,
        nextBillingDate: stripeSubscription?.cancel_at
          ? new Date(stripeSubscription.cancel_at * 1000)
          : stripeSubscription?.current_period_end
            ? new Date(stripeSubscription.current_period_end * 1000)
            : (order.nextBillingDate ?? null),
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        stripeSubscriptionId: order.stripeSubscriptionId,
        paymentMethodId: order.paymentMethodId,
        cancelledAt: stripeSubscription?.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
        cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end ?? false,
        paymentMethod: stripePaymentMethod
          ? {
              brand: stripePaymentMethod.card?.brand ?? null,
              last4: stripePaymentMethod.card?.last4 ?? null,
              expMonth: stripePaymentMethod.card?.exp_month ?? null,
              expYear: stripePaymentMethod.card?.exp_year ?? null
            }
          : null,
        user: order.user
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to get subscription by id', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id
    })

    return {
      success: false,
      error: 'Failed to get subscription. Please try again.',
      data: null
    }
  }
}
