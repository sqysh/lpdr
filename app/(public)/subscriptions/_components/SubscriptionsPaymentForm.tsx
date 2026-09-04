'use client'

import { useCallback, useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { usePaymentProcessor } from 'lib/hooks/usePaymentProcessor.hook'
import { useDefaultCard } from 'lib/hooks/useDefaultCard.hook'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { BillingInterval, Tier } from 'types/subscriptions.types'
import { createSubscriptionWithSavedCard } from 'lib/actions/_stripe/createSubscriptionWithSavedCard'
import { createSetupIntentForSubscription } from 'lib/actions/_stripe/createSetupIntentForSubscription'
import { createSubscriptionAfterSetup } from 'lib/actions/_stripe/createSubscriptionAfterSetup'
import { IPaymentMethod } from 'types/payment-method.types'
import { ordinal } from 'lib/utils/date.utils'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { CardElementField } from 'components/features/payment/CardElementField'
import { useThemeStore } from 'stores/theme.store'
import { calculateStripeFees } from 'lib/utils/fees.utils'

type PaymentInputs = {
  firstName: string
  lastName: string
  email: string
  selectedCardId: string | null
  useNewCard: boolean
  cardComplete: boolean
  coverFees: boolean
  loading: boolean
  error: string | null
}

type Props = {
  tier: Tier
  billing: BillingInterval
  savedCards: IPaymentMethod[]
  isAuthed: boolean
  firstName: string
  lastName: string
  email: string
  isDark?: boolean
}

export function SubscriptionPaymentForm({
  tier,
  billing,
  savedCards,
  isAuthed,
  firstName: initialFirstName,
  lastName: initialLastName,
  email: initialEmail,
  isDark
}: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const storeDark = useThemeStore((s) => s.isDark)
  const dark = isDark ?? storeDark
  const { setupPusherListenerRecurring } = usePaymentProcessor()

  const c = {
    box: dark ? 'border-border-dark bg-surface-dark' : 'border-border-light bg-surface-light',
    notice: dark ? 'border-primary-dark bg-surface-dark' : 'border-primary-light bg-surface-light',
    muted: dark ? 'text-muted-dark' : 'text-muted-light',
    text: dark ? 'text-text-dark' : 'text-text-light',
    primary: dark ? 'text-primary-dark' : 'text-primary-light'
  }

  // ── Local state, seeded from props ──
  const [inputs, setInputs] = useState<PaymentInputs>({
    firstName: initialFirstName ?? '',
    lastName: initialLastName ?? '',
    email: initialEmail ?? '',
    selectedCardId: null,
    useNewCard: false,
    cardComplete: false,
    coverFees: true,
    loading: false,
    error: null
  })

  const patch = (data: Partial<PaymentInputs>) => setInputs((prev) => ({ ...prev, ...data }))
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    patch({ [e.target.name]: e.target.value } as Partial<PaymentInputs>)
  }
  // ── Derived ──
  const baseAmount = tier.price[billing]
  const processingFee = calculateStripeFees(baseAmount)
  const finalAmount = inputs.coverFees ? Math.round((baseAmount + processingFee) * 100) / 100 : baseAmount
  const usingSavedCard = !!inputs.selectedCardId && !inputs.useNewCard && isAuthed
  const enteringNewCard = !isAuthed || savedCards.length === 0 || inputs.useNewCard

  const isValid =
    !!inputs.firstName.trim() &&
    !!inputs.lastName.trim() &&
    !!inputs.email.trim() &&
    (usingSavedCard ? true : inputs.cardComplete)

  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [])
  useDefaultCard(savedCards, setDefaultCard)

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!stripe || !elements || !isValid) return

    patch({ loading: true, error: null })

    try {
      const name = `${inputs.firstName.trim()} ${inputs.lastName.trim()}`
      const email = inputs.email.trim()

      const basePayload = {
        tierId: tier.id,
        frequency: billing,
        coverFees: inputs.coverFees
      }

      if (inputs.selectedCardId && !inputs.useNewCard) {
        const result = await createSubscriptionWithSavedCard({
          ...basePayload,
          savedCardId: inputs.selectedCardId
        })
        if (!result.success) throw new Error(result.error ?? 'Failed to create subscription')
        setupPusherListenerRecurring({ subscriptionId: result.data.subscriptionId })
      } else {
        const setupResult = await createSetupIntentForSubscription(basePayload)
        if (!setupResult.success) throw new Error(setupResult.error ?? 'Failed to create setup intent')

        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        const { error: stripeError } = await stripe.confirmCardSetup(setupResult.data.clientSecret, {
          payment_method: { card: cardElement, billing_details: { email, name } }
        })

        if (stripeError) {
          patch({ error: stripeError.message ?? 'Card confirmation failed', loading: false })
          return
        }

        const subscriptionResult = await createSubscriptionAfterSetup({
          ...basePayload,
          setupIntentId: setupResult.data.setupIntentId
        })
        if (!subscriptionResult.success) throw new Error(subscriptionResult.error ?? 'Failed to create subscription')

        setupPusherListenerRecurring({
          subscriptionId: subscriptionResult.data.subscriptionId
        })
      }
    } catch (err) {
      patch({
        loading: false,
        error: err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Subscription payment form" className="dark space-y-5 max-w-lg">
      {/* ── Plan summary ── */}
      <div className={`flex items-center justify-between px-4 py-3 border ${c.box}`}>
        <div>
          <p className={`text-[10px] font-mono tracking-[0.2em] uppercase mb-0.5 ${c.muted}`}>{billing} plan</p>
          <p className={`font-quicksand font-black text-sm ${c.text}`}>{tier.name}</p>
        </div>
        <div className="text-right">
          <p className={`font-quicksand font-black text-xl tabular-nums ${c.primary}`}>${baseAmount}</p>
          <p className={`text-[10px] font-mono ${c.muted}`}>/{billing === 'MONTHLY' ? 'mo' : 'yr'}</p>
        </div>
      </div>

      {/* ── Billing notice ── */}
      <div className={`px-4 py-3 border-l-2 ${c.notice}`}>
        <p className={`text-[11px] font-mono leading-relaxed ${c.muted}`}>
          Your card will be charged{' '}
          <span className={c.text}>
            {billing === 'MONTHLY'
              ? `on the ${ordinal(new Date().getDate())} of each month`
              : `every year on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
          </span>
          . Cancel anytime.
        </p>
      </div>

      {/* ── Name ── */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
        <FormField
          id="checkout-firstName"
          label="First Name"
          name="firstName"
          value={inputs?.firstName ?? ''}
          onChange={handleInput}
          placeholder="Jane"
          autoComplete="given-name"
          required
        />
        <FormField
          id="checkout-lastName"
          label="Last Name"
          name="lastName"
          value={inputs?.lastName ?? ''}
          onChange={handleInput}
          placeholder="Doe"
          autoComplete="family-name"
          required
        />
      </div>

      {/* Saved cards */}
      {isAuthed && (
        <SavedCardSelector
          savedCards={savedCards}
          selectedCardId={inputs.selectedCardId}
          useNewCard={inputs.useNewCard}
          onSelectCard={(id) => patch({ selectedCardId: id })}
          onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
          onUseSavedCard={() => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })}
        />
      )}

      {/* Card element */}
      {enteringNewCard && (
        <CardElementField isDark={dark} onChange={({ complete, error }) => patch({ cardComplete: complete, error })} />
      )}

      {/* Cover fees */}
      <CoverFeesToggle checked={inputs.coverFees} onChange={(v) => patch({ coverFees: v })} processingFee={processingFee} />

      {/* ── Card storage note (replaces SaveCardToggle — saving is required for subscriptions) ── */}
      {enteringNewCard && (
        <p className={`text-[10px] font-mono leading-relaxed ${c.muted}`}>
          Your card will be securely saved with Stripe to process your recurring {billing === 'MONTHLY' ? 'monthly' : 'yearly'}{' '}
          payments.
        </p>
      )}

      {/* Error */}
      <FormError error={inputs.error} />

      {/* Submit */}
      <SubmitButton
        loading={inputs.loading}
        isValid={isValid}
        label={`Subscribe · $${inputs.coverFees ? finalAmount.toFixed(2) : baseAmount.toFixed(2)}/${billing === 'MONTHLY' ? 'mo' : 'yr'}`}
      />

      {/* ── Security note ── */}
      <p className={`flex items-center justify-center gap-2 text-[10px] font-mono ${c.muted}`}>
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
        Secured by Stripe. We never store your card details.
      </p>
    </form>
  )
}
