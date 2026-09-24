'use client'

import { useCallback, useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { createPaymentIntent } from 'lib/actions/_stripe/createPaymentIntent'
import { useDefaultCard } from 'lib/hooks/useDefaultCard.hook'
import type { IPaymentMethod } from 'types/payment-method.types'
import { useRouter } from 'next/navigation'
import { waitForOrder } from 'lib/pusher/waitForOrder'

export type PaymentState = {
  cardComplete: boolean
  selectedCardId: string | null
  useNewCard: boolean
  saveCard: boolean
  coverFees: boolean
  loading: boolean
  error: string | null
}

export function useStripeCheckout({
  savedCards,
  isAuthed = true,
  userId,
  billingName,
  billingEmail
}: {
  savedCards: IPaymentMethod[]
  /** Only the donation forms can be reached signed out; everything else redirects first. */
  isAuthed?: boolean
  userId: string
  billingName: string
  billingEmail: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [payment, setPayment] = useState<PaymentState>({
    cardComplete: false,
    selectedCardId: savedCards[0]?.stripePaymentId ?? null,
    useNewCard: savedCards.length === 0,
    saveCard: false,
    coverFees: true,
    loading: false,
    error: null
  })

  const patch = (data: Partial<PaymentState>) => setPayment((prev) => ({ ...prev, ...data }))

  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [])
  useDefaultCard(savedCards, isAuthed, setDefaultCard)

  const usingSavedCard = !!payment.selectedCardId && !payment.useNewCard && isAuthed

  /** Payload is everything except the card choice — the caller owns what is being bought. */
  const pay = async (basePayload: Record<string, unknown>) => {
    if (!stripe || !elements || payment.loading) return

    patch({ loading: true, error: null })

    // Subscribe before the payment goes anywhere near Stripe. Pusher does not replay, so a
    // webhook that lands before the listener is attached is a confirmation that never arrives,
    // and the person sits through the full timeout on a payment that actually succeeded.
    const orderConfirmed = waitForOrder(userId, router)
    // Attaching a handler here only stops an unhandled rejection warning while we work; the
    // rejection is still delivered to the await below.
    orderConfirmed.catch(() => {})

    try {
      if (usingSavedCard) {
        const result = await createPaymentIntent({ ...basePayload, savedCardId: payment.selectedCardId })
        if (!result.success) throw new Error(result.error)

        // Loading stays on until the webhook confirms and we navigate, so the
        // button cannot be pressed twice on a charge that already went through
        await orderConfirmed
        return
      }

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const intentResult = await createPaymentIntent({ ...basePayload, saveCard: payment.saveCard })
      if (!intentResult.success) throw new Error(intentResult.error)

      const result = await stripe.confirmCardPayment(intentResult.data.clientSecret!, {
        payment_method: { card: cardElement, billing_details: { name: billingName, email: billingEmail } }
      })

      if (result.error) {
        patch({ loading: false, error: result.error.message ?? 'Payment failed' })
        return
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        patch({ loading: false, error: 'Payment did not complete. Please try again.' })
        return
      }

      await orderConfirmed
    } catch (err) {
      patch({ loading: false, error: err instanceof Error ? err.message : 'Something went wrong. Please try again.' })
    }
  }

  return { payment, patch, usingSavedCard, pay, ready: !!stripe && !!elements }
}
