'use client'

import { BillingInterval, Tier } from 'types/subscriptions.types'
import { IPaymentMethod } from 'types/payment-method.types'
import { ordinal } from 'lib/utils/date.utils'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { CardElementField } from 'components/features/payment/CardElementField'
import { StripeSecurityNote } from 'components/features/payment/StripeSecurityNote'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubscriptionFormInput, subscriptionFormSchema, SubscriptionFormValues } from 'lib/schemas/subscription.schema'
import { useSubscriptionStripeCheckout } from 'lib/hooks/useSubscriptionStripeCheckout.hook'

export function SubscriptionPaymentForm({
  tier,
  billing,
  savedCards,
  isAuthed,
  firstName: initialFirstName,
  lastName: initialLastName,
  email
}: {
  tier: Tier
  billing: BillingInterval
  savedCards: IPaymentMethod[]
  isAuthed: boolean
  firstName: string
  lastName: string
  email: string
}) {
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
      lastName: initialLastName ?? '',
      donorMessage: ''
    }
  })

  const values = useWatch({ control })

  const { payment, patch, usingSavedCard, enteringNewCard, subscribe } = useSubscriptionStripeCheckout({ savedCards, isAuthed, email })

  const baseAmount = tier.price[billing]
  const processingFee = calculateStripeFees(baseAmount)
  const finalAmount = payment.coverFees ? Math.round((baseAmount + processingFee) * 100) / 100 : baseAmount
  const isValid = !!values.firstName?.trim() && !!values.lastName?.trim() && (usingSavedCard ? true : payment.cardComplete)

  const onSubmit = (data: SubscriptionFormValues) => {
    if (!isValid) return

    return subscribe({
      tierId: tier.id,
      frequency: billing,
      name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      donorMessage: data.donorMessage || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Subscription payment form" className="space-y-5 max-w-lg">
      {/* ── Plan summary ── */}
      <div className="flex items-center justify-between px-4 py-3 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div>
          <p className="text-[10px] font-mono tracking-eyebrow uppercase mb-0.5 text-muted-light dark:text-muted-dark">{billing} plan</p>
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

      {/* ── Message ── */}
      <FormField
        id="subscription-message"
        label="Leave a message"
        type="textarea"
        rows={3}
        {...register('donorMessage')}
        placeholder="In memory of..."
        hint="Optional. For example, a gift in memory of someone special."
        error={errors.donorMessage?.message}
      />

      {/* Saved cards */}
      {isAuthed && savedCards.length > 0 && (
        <SavedCardSelector
          savedCards={savedCards}
          selectedCardId={payment.selectedCardId}
          useNewCard={payment.useNewCard}
          onSelectCard={(id) => patch({ selectedCardId: id, useNewCard: false })}
          onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
          onUseSavedCard={() => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })}
        />
      )}

      {/* Card element */}
      {enteringNewCard && <CardElementField onChange={({ complete, error }) => patch({ cardComplete: complete, error })} />}

      {/* Cover fees */}
      <CoverFeesToggle checked={payment.coverFees} onChange={(v) => patch({ coverFees: v })} processingFee={processingFee} />

      {/* Saving is required for subscriptions, so this replaces the save-card toggle */}
      {enteringNewCard && (
        <p className="text-[10px] font-mono leading-relaxed text-muted-light dark:text-muted-dark">
          Your card will be securely saved with Stripe to process your recurring {billing === 'MONTHLY' ? 'monthly' : 'yearly'} payments.
        </p>
      )}

      <FormError error={payment.error} />

      <SubmitButton
        loading={payment.loading}
        isValid={isValid}
        label={`Subscribe · $${payment.coverFees ? finalAmount.toFixed(2) : baseAmount.toFixed(2)}/${billing === 'MONTHLY' ? 'mo' : 'yr'}`}
      />

      <StripeSecurityNote />
    </form>
  )
}
