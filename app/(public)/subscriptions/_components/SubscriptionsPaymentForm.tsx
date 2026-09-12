'use client'

import { useCallback, useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
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
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { SubscriptionFormInput, subscriptionFormSchema, SubscriptionFormValues } from 'lib/schemas/subscription.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { StripeSecurityNote } from './StripeSecurityNote'
import { waitForOrder } from 'lib/pusher/waitForOrder'

type PaymentInputs = {
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
}

export function SubscriptionPaymentForm({
  tier,
  billing,
  savedCards,
  isAuthed,
  firstName: initialFirstName,
  lastName: initialLastName,
  email
}: Props) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<SubscriptionFormInput, unknown, SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: initialFirstName ?? '',
      lastName: initialLastName ?? ''
    }
  })

  const values = useWatch({ control })

  const [inputs, setInputs] = useState<PaymentInputs>({
    selectedCardId: null,
    useNewCard: false,
    cardComplete: false,
    coverFees: true,
    loading: false,
    error: null
  })

  const patch = (data: Partial<PaymentInputs>) => setInputs((prev) => ({ ...prev, ...data }))

  // ── Derived ──
  const baseAmount = tier.price[billing]
  const processingFee = calculateStripeFees(baseAmount)
  const finalAmount = inputs.coverFees ? Math.round((baseAmount + processingFee) * 100) / 100 : baseAmount
  const usingSavedCard = !!inputs.selectedCardId && !inputs.useNewCard && isAuthed
  const enteringNewCard = !isAuthed || savedCards.length === 0 || inputs.useNewCard

  const isValid = !!values.firstName?.trim() && !!values.lastName?.trim() && (usingSavedCard ? true : inputs.cardComplete)
  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [])
  useDefaultCard(savedCards, isAuthed, setDefaultCard)

  const onSubmit = async (data: SubscriptionFormValues) => {
    if (!stripe || !elements || !isValid) return

    patch({ loading: true, error: null })

    try {
      const name = `${data.firstName.trim()} ${data.lastName.trim()}`

      const basePayload = {
        tierId: tier.id,
        frequency: billing,
        coverFees: inputs.coverFees
      }

      if (usingSavedCard) {
        const result = await createSubscriptionWithSavedCard({
          ...basePayload,
          savedCardId: inputs.selectedCardId
        })

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

      const subscriptionResult = await createSubscriptionAfterSetup({
        setupIntentId: setupResult.data.setupIntentId
      })

      if (!subscriptionResult.success) throw new Error(subscriptionResult.error ?? 'Failed to create subscription')

      await waitForOrder(subscriptionResult.data.subscriptionId, router)
    } catch (err) {
      patch({
        loading: false,
        error: err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Subscription payment form" className="space-y-5 max-w-lg">
      {/* ── Plan summary ── */}
      <div className="flex items-center justify-between px-4 py-3 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div>
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase mb-0.5 text-muted-light dark:text-muted-dark">{billing} plan</p>
          <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark">{tier.name}</p>
        </div>
        <div className="text-right">
          <p className="font-quicksand font-black text-xl tabular-nums text-primary-light dark:text-primary-dark">${baseAmount}</p>
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">/{billing === 'MONTHLY' ? 'mo' : 'yr'}</p>
        </div>
      </div>

      {/* ── Billing notice ── */}
      <div className="px-4 py-3 border-l-2 border-primary-light dark:border-primary-dark bg-surface-light dark:bg-surface-dark">
        <p className="text-[11px] font-mono leading-relaxed text-muted-light dark:text-muted-dark">
          Your card will be charged{' '}
          <span className="text-text-light dark:text-text-dark">
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
          id="subscription-firstName"
          label="First Name"
          {...register('firstName')}
          placeholder="Jane"
          autoComplete="given-name"
          error={errors.firstName?.message}
          required
        />
        <FormField
          id="subscription-lastName"
          label="Last Name"
          {...register('lastName')}
          placeholder="Doe"
          autoComplete="family-name"
          error={errors.lastName?.message}
          required
        />
      </div>

      {/* Saved cards */}
      {isAuthed && savedCards.length > 0 && (
        <SavedCardSelector
          savedCards={savedCards}
          selectedCardId={inputs.selectedCardId}
          useNewCard={inputs.useNewCard}
          onSelectCard={(id) => patch({ selectedCardId: id, useNewCard: false })}
          onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
          onUseSavedCard={() => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })}
        />
      )}

      {/* Card element */}
      {enteringNewCard && <CardElementField onChange={({ complete, error }) => patch({ cardComplete: complete, error })} />}

      {/* Cover fees */}
      <CoverFeesToggle checked={inputs.coverFees} onChange={(v) => patch({ coverFees: v })} processingFee={processingFee} />

      {/* ── Card storage note (replaces SaveCardToggle — saving is required for subscriptions) ── */}
      {enteringNewCard && (
        <p className="text-[10px] font-mono leading-relaxed text-muted-light dark:text-muted-dark">
          Your card will be securely saved with Stripe to process your recurring {billing === 'MONTHLY' ? 'monthly' : 'yearly'} payments.
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
      <StripeSecurityNote />
    </form>
  )
}
