import { useCallback, useState } from 'react'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { calculateStripeFees } from 'lib/stripe/calculateStripeFees'
import { OrderType } from '@prisma/client'
import { usePaymentProcessor } from 'lib/hooks/usePaymentProcessor.hook'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import { useDefaultCard } from 'lib/hooks/useDefaultCard.hook'
import { createPaymentIntent } from 'lib/actions/_stripe/createPaymentIntent'
import { IPaymentMethod } from 'types/_payment-method.types'
import { AdoptionSaveCardToggle } from './AdoptionSaveCardToggle'
import { CardElementField, FormError, SubmitButton } from 'components/_primitives'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'

type PaymentInputs = {
  selectedCardId: string | null
  useNewCard: boolean
  cardComplete: boolean
  coverFees: boolean
  saveCard: boolean
  loading: boolean
  error: string | null
}

type Props = {
  savedCards: IPaymentMethod[]
  isAuthed: boolean
  firstName: string
  lastName: string
  email: string
}

export function Step3PaymentForm({ savedCards, isAuthed, firstName, lastName, email }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const { setupPusherListenerOneTime } = usePaymentProcessor()

  // ── Payment-only local state ──
  const [payment, setPayment] = useState<PaymentInputs>({
    selectedCardId: null,
    useNewCard: false,
    cardComplete: false,
    coverFees: true,
    saveCard: false,
    loading: false,
    error: null
  })

  const patch = (data: Partial<PaymentInputs>) => setPayment((prev) => ({ ...prev, ...data }))

  // ── Derived values ───
  const feeAmount = 15
  const processingFee = calculateStripeFees(feeAmount)
  const feesCovered = payment.coverFees ? processingFee : 0
  const finalAmount = payment.coverFees ? feeAmount + processingFee : feeAmount
  const usingSavedCard = !!payment.selectedCardId && !payment.useNewCard && isAuthed

  const isValid =
    !!firstName.trim() &&
    !!lastName.trim() &&
    EMAIL_REGEX.test(email) &&
    (usingSavedCard ? true : payment.cardComplete)

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [])
  useDefaultCard(savedCards, setDefaultCard)

  // ── Handlde Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!stripe || !elements) return

    patch({ loading: true, error: null })

    try {
      const name = `${firstName.trim()} ${lastName.trim()}`
      const trimmedEmail = email.trim()
      const amountInCents = Math.round(finalAmount * 100)

      const basePayload = {
        email: trimmedEmail,
        name,
        amount: amountInCents,
        coverFees: payment.coverFees,
        feesCovered,
        orderType: 'ADOPTION_FEE' as OrderType
      }

      if (usingSavedCard) {
        const result = await createPaymentIntent({
          ...basePayload,
          savedCardId: payment.selectedCardId
        })

        if (!result.success) throw new Error(result.error)

        setupPusherListenerOneTime()
      } else {
        // ── New card — confirmed client-side ──
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        const intentResult = await createPaymentIntent({
          amount: amountInCents,
          name,
          email: trimmedEmail,
          orderType: 'ADOPTION_FEE',
          saveCard: payment.saveCard,
          coverFees: payment.coverFees,
          feesCovered
        })

        if (!intentResult.success) throw new Error(intentResult.error)

        const result = await stripe.confirmCardPayment(intentResult.clientSecret!, {
          payment_method: {
            card: cardElement,
            billing_details: { name, email: trimmedEmail }
          }
        })

        if (result.error) {
          patch({ error: result.error.message || 'Payment failed' })
        } else if (result.paymentIntent?.status === 'succeeded') {
          setupPusherListenerOneTime()
        }
      }
    } catch (err) {
      patch({
        loading: false,
        error: err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Adoption fee form" className="space-y-6">
      {/* ── Saved cards ── */}
      {isAuthed && (
        <SavedCardSelector
          savedCards={savedCards}
          selectedCardId={payment.selectedCardId}
          useNewCard={payment.useNewCard}
          onSelectCard={(id) => patch({ selectedCardId: id })}
          onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
          onUseSavedCard={() =>
            patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })
          }
        />
      )}

      {/* ── Card element ── */}
      {(!isAuthed || savedCards.length === 0 || payment.useNewCard) && (
        <CardElementField
          onChange={({ complete, error }) => patch({ cardComplete: complete, error })}
        />
      )}

      {/* ── Cover fees ── */}
      <CoverFeesToggle
        checked={payment.coverFees}
        onChange={(v) => patch({ coverFees: v })}
        processingFee={processingFee}
      />

      {/* ── Save card ── */}
      <AdoptionSaveCardToggle
        checked={payment.saveCard}
        onChange={(v: boolean) => patch({ saveCard: v })}
        isAuthed={isAuthed}
        selectedCardId={payment.selectedCardId}
        useNewCard={payment.useNewCard}
      />

      {/* ── Error ── */}
      <FormError error={payment.error} />

      {/* ── Submit ── */}
      <SubmitButton
        loading={payment.loading}
        isValid={isValid}
        label={`Pay $${payment.coverFees ? finalAmount.toFixed(2) : feeAmount.toFixed(2)}`}
      />

      <p className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-light dark:text-muted-dark">
        <svg
          viewBox="0 0 24 24"
          className="w-3 h-3 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="square"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Secured by Stripe. We never store your card details. All donations are final and
        non-refundable.
      </p>
    </form>
  )
}
