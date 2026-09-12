import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { OrderType } from '@prisma/client'
import { StepSignIn } from 'components/features/payment/SignInStep'
import { SignedInRow } from 'components/features/payment/SignedInRow'
import { formatWithCommas } from 'lib/utils/currency.utils'
import { IPaymentMethod } from 'types/payment-method.types'
import { PresetAmounts } from './PresetAmounts'
import { DonateSaveCardToggle } from './DonateSaveCardToggle'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { CardElementField } from 'components/features/payment/CardElementField'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { useSearchParams } from 'next/navigation'
import { DONATION_PRESETS } from 'lib/constants/donation.constants'
import { DonateFormInput, DonateFormValues, donateSchema } from 'lib/schemas/donate.schema'
import { useStripeCheckout } from '@hooks/useStripeCheckout.hook'

type AmountState = {
  useCustom: boolean
  customAmount: string
  selectedAmount: number | null
}

type Props = {
  savedCards: IPaymentMethod[]
  userName: { firstName?: string; lastName?: string } | null
  isAuthed: boolean
  email: string | null
  userId: string | null
}

export function DonateForm({ savedCards, userName, isAuthed, email, userId }: Props) {
  const searchParams = useSearchParams()
  const seededParam = Number(searchParams.get('donationAmount'))
  const seeded = Number.isFinite(seededParam) && seededParam > 0 ? seededParam : null
  const seededIsPreset = seeded !== null && DONATION_PRESETS.includes(seeded)

  const [amount, setAmount] = useState<AmountState>({
    useCustom: seeded !== null && !seededIsPreset,
    customAmount: seeded !== null && !seededIsPreset ? String(seeded) : '',
    selectedAmount: seeded !== null && seededIsPreset ? seeded : 25
  })

  const patchAmount = (data: Partial<AmountState>) => setAmount((prev) => ({ ...prev, ...data }))

  const [amountBlurred, setAmountBlurred] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<DonateFormInput, unknown, DonateFormValues>({
    resolver: zodResolver(donateSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: userName?.firstName ?? '',
      lastName: userName?.lastName ?? ''
    }
  })

  const values = useWatch({ control })

  const { payment, patch, usingSavedCard, pay } = useStripeCheckout({
    savedCards,
    isAuthed,
    userId,
    billingName: `${values.firstName} ${values.lastName}`,
    billingEmail: email ?? ''
  })

  // ── Derived values ────────────────────────────────────────────────────────
  const donationAmount = amount.useCustom ? parseFloat(amount.customAmount) || 0 : (amount.selectedAmount ?? 0)
  const processingFee = calculateStripeFees(donationAmount)
  const finalAmount = payment.coverFees ? donationAmount + processingFee : donationAmount
  const enteringNewCard = !isAuthed || savedCards.length === 0 || payment.useNewCard

  const isValid =
    donationAmount >= 5 &&
    !!values.firstName?.trim() &&
    !!values.lastName?.trim() &&
    (usingSavedCard ? true : payment.cardComplete)

  const handlePresetSelect = (value: number) => patchAmount({ selectedAmount: value, useCustom: false, customAmount: '' })

  const onSubmit = () =>
    pay({
      amount: Math.round(donationAmount * 100),
      coverFees: payment.coverFees,
      orderType: 'ONE_TIME_DONATION' as OrderType
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="One-time donation form" className="w-full space-y-5">
      {/* Preset amounts */}
      <PresetAmounts
        inputs={{ useCustom: amount.useCustom, selectedAmount: amount.selectedAmount }}
        onSelect={handlePresetSelect}
      />

      {/* ── Custom amount ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.5} className="mb-6">
        <label
          htmlFor="custom-amount"
          className="block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2"
        >
          Custom Amount
          <span className="ml-1 text-muted-light/60 dark:text-muted-dark/60 normal-case tracking-normal font-sans">(min $5)</span>
        </label>
        <div className="relative">
          <span
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-quicksand font-black text-sm pointer-events-none transition-colors duration-200 ${
              amount?.useCustom ? 'text-primary-light dark:text-primary-dark' : 'text-muted-light dark:text-muted-dark'
            }`}
            aria-hidden="true"
          >
            $
          </span>
          <input
            id="custom-amount"
            type="text"
            inputMode="numeric"
            placeholder="Enter amount"
            value={amount?.customAmount ? formatWithCommas(amount.customAmount) : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              patchAmount({ customAmount: raw, useCustom: true, selectedAmount: null })
            }}
            onFocus={() => {
              setAmountBlurred(false)
              patchAmount({ useCustom: true, selectedAmount: null })
            }}
            onBlur={() => setAmountBlurred(true)}
            aria-describedby="custom-amount-hint"
            className={`
              w-full pl-8 pr-4 py-3 text-sm font-quicksand font-bold border-2 bg-surface-light dark:bg-surface-dark
              text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50
              transition-colors duration-200 focus:outline-none
              ${amount?.useCustom ? 'border-primary-light dark:border-primary-dark' : 'border-border-light dark:border-border-dark'}
              focus-visible:border-primary-light dark:focus-visible:border-primary-dark
            `}
          />
          {amount?.useCustom && amountBlurred && amount?.customAmount && parseFloat(amount?.customAmount) < 5 && (
            <p
              id="custom-amount-hint"
              role="alert"
              className="absolute text-[11px] text-red-500 dark:text-red-400 mt-1.5 font-mono"
            >
              Minimum donation is $5
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Amount display ── */}
      {donationAmount >= 5 && (
        <motion.div
          key={donationAmount}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.75}
          className="flex items-center gap-3 mb-6 py-3 px-4 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
        >
          <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
            Donating
          </span>
          <span className="font-quicksand font-black text-2xl text-primary-light dark:text-primary-dark">
            ${formatWithCommas(donationAmount)}
          </span>
          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark ml-auto">one-time</span>
        </motion.div>
      )}

      {!isAuthed && <StepSignIn redirectTo={`/donate?donationAmount=${donationAmount}`} />}

      {isAuthed && <SignedInRow />}

      {isAuthed && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1.25} className="space-y-5">
          {/* ── Name + Email ── */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
            <FormField
              id="donate-firstName"
              label="First Name"
              {...register('firstName')}
              placeholder="Jane"
              autoComplete="given-name"
              error={errors.firstName?.message}
              required
            />
            <FormField
              id="donate-lastName"
              label="Last Name"
              {...register('lastName')}
              placeholder="Smith"
              autoComplete="family-name"
              error={errors.lastName?.message}
              required
            />
          </div>
          {/* ── Email ── */}
          <FormField
            id="donate-email"
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={() => {}}
            autoComplete="email"
            disabled
            readOnly
            hint="Using your signed-in account email."
          />

          {/* Saved cards */}
          {isAuthed && (
            <SavedCardSelector
              savedCards={savedCards}
              selectedCardId={payment.selectedCardId}
              useNewCard={payment.useNewCard}
              onSelectCard={(id) => patch({ selectedCardId: id, useNewCard: false })}
              onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
              onUseSavedCard={() => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })}
            />
          )}

          {/* ── Card element ── */}
          {enteringNewCard && (
            <CardElementField onChange={({ complete, error }) => patch({ cardComplete: complete, error: error ?? null })} />
          )}

          {/* ── Cover fees ── */}
          <CoverFeesToggle
            checked={payment.coverFees}
            onChange={() => patch({ coverFees: !payment.coverFees })}
            processingFee={processingFee}
          />

          {/* Save card — donate-specific wrapper */}
          <DonateSaveCardToggle
            checked={payment.saveCard}
            onToggle={() => patch({ saveCard: !payment.saveCard })}
            usingNewCard={enteringNewCard}
          />

          {/* Error */}
          <FormError error={payment.error} />

          {/* Submit */}
          <SubmitButton
            loading={payment.loading}
            isValid={isValid}
            label={`Pay $${(payment.coverFees ? finalAmount : donationAmount).toFixed(2)}`}
          />
        </motion.div>
      )}

      {/* ── Security note ── */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1.5}
        className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-light dark:text-muted-dark"
      >
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
      </motion.p>
    </form>
  )
}
