import { stripeClient } from 'lib/stripe/stripe-client'
import prisma from 'prisma/client'

export async function validateSavedCard({
  savedCardId,
  userId,
  customerId
}: {
  savedCardId: string
  userId: string
  customerId: string
}): Promise<string> {
  const [savedCard, paymentMethod] = await Promise.all([
    prisma.paymentMethod.findUnique({
      where: { stripePaymentId: savedCardId },
      select: { stripePaymentId: true, userId: true }
    }),
    stripeClient.paymentMethods.retrieve(savedCardId)
  ])

  if (!savedCard || savedCard.userId !== userId) {
    throw new Error('Saved card not found or unauthorized')
  }

  if (paymentMethod.customer !== customerId) {
    throw new Error('Payment method does not belong to this customer')
  }

  return savedCard.stripePaymentId
}
