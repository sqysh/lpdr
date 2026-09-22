import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { OrderType } from '@prisma/client'
import { StepSignIn } from 'components/features/payment/SignInStep'
import { SignedInRow } from 'components/features/payment/SignedInRow'
import { formatMoney, formatWithCommas } from 'lib/utils/currency.utils'
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
import Link from 'next/link'
import { LinkBody } from 'components/_common/LinkBody'
import { ArrowRight } from 'lucide-react'
import { StripeSecurityNote } from 'components/features/payment/StripeSecurityNote'
import { CustomAmount } from './CustomAmount'

export type AmountState = {
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
    donationAmount >= 5 && !!values.firstName?.trim() && !!values.lastName?.trim() && (usingSavedCard ? true : payment.cardComplete)

  const handlePresetSelect = (value: number) => patchAmount({ selectedAmount: value, useCustom: false, customAmount: '' })

  const onSubmit = (data: DonateFormValues) =>
    pay({
      amount: Math.round(donationAmount * 100),
      coverFees: payment.coverFees,
      orderType: 'ONE_TIME_DONATION' as OrderType,
      donorMessage: data.donorMessage || undefined
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="One-time donation form" className="w-full space-y-5">
      {/* Preset amounts */}
      <PresetAmounts inputs={{ useCustom: amount.useCustom, selectedAmount: amount.selectedAmount }} onSelect={handlePresetSelect} />

      {/* ── Custom amount ── */}
      <CustomAmount amount={amount} patchAmount={patchAmount} />

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
          <span className="text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark">Donating</span>
          <span className="font-quicksand font-black text-2xl text-primary-light dark:text-primary-dark">
            ${formatWithCommas(donationAmount)}
          </span>
          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark ml-auto">one-time</span>
        </motion.div>
      )}

      {/* ── Monthly alternative ── */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={1}
        className="text-[11px] font-mono text-muted-light dark:text-muted-dark"
      >
        Prefer to give every month?{' '}
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-1 text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <LinkBody icon={<ArrowRight className="w-3 h-3" aria-hidden="true" />} label="See monthly plans" iconAfter />
        </Link>
      </motion.p>

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

          {/* —— Message —— */}
          <FormField
            id="donate-message"
            label="Leave a message"
            type="textarea"
            rows={3}
            {...register('donorMessage')}
            placeholder="In memory of..."
            hint="Optional. For example, a donation in memory of someone special."
            error={errors.donorMessage?.message}
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
            label={`Pay ${formatMoney(payment.coverFees ? finalAmount : donationAmount)}`}
          />
        </motion.div>
      )}

      <StripeSecurityNote />
    </form>
  )
}
