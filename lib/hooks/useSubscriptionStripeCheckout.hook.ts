'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { useDefaultCard } from 'lib/hooks/useDefaultCard.hook'
import { createSubscriptionWithSavedCard } from 'lib/actions/_stripe/createSubscriptionWithSavedCard'
import { createSetupIntentForSubscription } from 'lib/actions/_stripe/createSetupIntentForSubscription'
import { createSubscriptionAfterSetup } from 'lib/actions/_stripe/createSubscriptionAfterSetup'
import { waitForOrder } from 'lib/pusher/waitForOrder'
import { BillingInterval } from 'types/subscriptions.types'
import { IPaymentMethod } from 'types/payment-method.types'

type PaymentInputs = {
  selectedCardId: string | null
  useNewCard: boolean
  cardComplete: boolean
  coverFees: boolean
  loading: boolean
  error: string | null
}

type SubscribeArgs = {
  tierId: string
  frequency: BillingInterval
  name: string
  donorMessage?: string
}

export function useSubscriptionStripeCheckout({
  savedCards,
  isAuthed,
  email
}: {
  savedCards: IPaymentMethod[]
  isAuthed: boolean
  email: string
}) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  const [payment, setPayment] = useState<PaymentInputs>({
    selectedCardId: null,
    useNewCard: false,
    cardComplete: false,
    coverFees: true,
    loading: false,
    error: null
  })

  const patch = useCallback((data: Partial<PaymentInputs>) => setPayment((prev) => ({ ...prev, ...data })), [])

  const usingSavedCard = !!payment.selectedCardId && !payment.useNewCard && isAuthed
  const enteringNewCard = !isAuthed || savedCards.length === 0 || payment.useNewCard

  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [patch])
  useDefaultCard(savedCards, isAuthed, setDefaultCard)

  const subscribe = async ({ tierId, frequency, name, donorMessage }: SubscribeArgs) => {
    if (!stripe || !elements) return

    patch({ loading: true, error: null })

    try {
      const basePayload = { tierId, frequency, coverFees: payment.coverFees, donorMessage }

      if (usingSavedCard) {
        const result = await createSubscriptionWithSavedCard({ ...basePayload, savedCardId: payment.selectedCardId })
        if (!result.success) throw new Error(result.error ?? 'Failed to create subscription')

        await waitForOrder(result.data.subscriptionId, router)
        return
      }

      const setupResult = await createSetupIntentForSubscription(basePayload)
      if (!setupResult.success) throw new Error(setupResult.error ?? 'Failed to create setup intent')

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error: stripeError } = await stripe.confirmCardSetup(setupResult.data.clientSecret, {
        payment_method: { card: cardElement, billing_details: { email, name } }
      })

      if (stripeError) {
        patch({ loading: false, error: stripeError.message ?? 'Card confirmation failed' })
        return
      }

      const subscriptionResult = await createSubscriptionAfterSetup({ setupIntentId: setupResult.data.setupIntentId })
      if (!subscriptionResult.success) throw new Error(subscriptionResult.error ?? 'Failed to create subscription')

      await waitForOrder(subscriptionResult.data.subscriptionId, router)
    } catch (err) {
      patch({ loading: false, error: err instanceof Error ? err.message : 'Something went wrong. Please try again.' })
    }
  }

  return { payment, patch, usingSavedCard, enteringNewCard, subscribe }
}
