import { useDefaultCard } from 'lib/hooks/useDefaultCard.hook'
import { usePaymentProcessor } from 'lib/hooks/usePaymentProcessor.hook'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { OrderType } from '@prisma/client'
import { calculateStripeFees } from 'lib/stripe/calculateStripeFees'
import { StepSignIn } from 'components/features/payment/SignInStep'
import { SignedInRow } from 'components/features/payment/SignedInRow'
import { formatWithCommas } from 'lib/utils/currency.utils'
import { createPaymentIntent } from 'lib/actions/_stripe/createPaymentIntent'
import { IPaymentMethod } from 'types/_payment-method.types'
import { PresetAmounts } from './PresetAmounts'
import { DonateSaveCardToggle } from './DonateSaveCardToggle'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { CardElementField } from 'components/features/payment/CardElementField'

export interface PaymentInputs {
  // amount
  selectedAmount: number | null
  useCustom: boolean
  customAmount: string
  // fees
  coverFees: boolean
  // card
  cardComplete: boolean
  selectedCardId: string | null
  useNewCard: boolean
  saveCard: boolean
  // identity
  firstName: string
  lastName: string
  email: string
  // ui
  loading: boolean
  error: string | null
}

type Props = {
  savedCards: IPaymentMethod[]
  userName: { firstName?: string; lastName?: string }
  isAuthed: boolean
  email: string
}

export function DonateForm({ savedCards, userName, isAuthed, email }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const { setupPusherListenerOneTime } = usePaymentProcessor()

  // ── URL param: pre-fill amount (e.g. from StepSignIn redirect) ────────────
  // Resolved once on mount via useSearchParams — keeps seeding synchronous.
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )
  const donationAmountFromUrl = searchParams.get('donationAmount')

  // ── Local state ───────────────────────────────────────────────────────────
  const [inputs, setInputs] = useState<PaymentInputs>({
    selectedAmount: donationAmountFromUrl ? Number(donationAmountFromUrl) : 25,
    useCustom: false,
    customAmount: '',
    coverFees: false,
    cardComplete: false,
    selectedCardId: savedCards[0]?.stripePaymentId ?? null,
    useNewCard: savedCards.length === 0,
    saveCard: false,
    firstName: userName?.firstName ?? '',
    lastName: userName?.lastName ?? '',
    email: email ?? '',
    loading: false,
    error: null
  })

  const patch = (data: Partial<PaymentInputs>) => setInputs((prev) => ({ ...prev, ...data }))

  const [amountBlurred, setAmountBlurred] = useState(false)

  // ── Derived values ────────────────────────────────────────────────────────
  const donationAmount = inputs.useCustom
    ? Math.max(5, parseFloat(inputs.customAmount) || 0)
    : (inputs.selectedAmount ?? 0)
  const processingFee = calculateStripeFees(donationAmount)
  const feesCovered = inputs.coverFees ? processingFee : 0
  const usingSavedCard = !!inputs.selectedCardId && !inputs.useNewCard && isAuthed
  const finalAmount = inputs.coverFees ? donationAmount + processingFee : donationAmount
  const enteringNewCard = !isAuthed || savedCards.length === 0 || inputs.useNewCard

  const isValid =
    donationAmount >= 5 &&
    !!inputs?.firstName?.trim() &&
    !!inputs?.lastName?.trim() &&
    EMAIL_REGEX.test(inputs?.email) &&
    (inputs?.selectedCardId && !inputs?.useNewCard ? true : inputs?.cardComplete)

  // ── Default card seeding ──────────────────────────────────────────────────
  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [])
  useDefaultCard(savedCards, setDefaultCard)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => patch({ [e.target.name]: e.target.value } as Partial<PaymentInputs>)

  const handlePresetSelect = (amount: number) =>
    patch({ selectedAmount: amount, useCustom: false, customAmount: '' })

  // ── Handlde Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!stripe || !elements || !isValid) return

    patch({ loading: true, error: null })

    try {
      const name = `${inputs?.firstName?.trim()} ${inputs?.lastName?.trim()}`
      const trimmedEmail = inputs.email.trim()
      const amountInCents = Math.round(finalAmount * 100)

      const basePayload = {
        email: trimmedEmail,
        name,
        amount: amountInCents,
        coverFees: inputs?.coverFees,
        feesCovered,
        orderType: 'ONE_TIME_DONATION' as OrderType
      }

      if (usingSavedCard) {
        const result = await createPaymentIntent({
          ...basePayload,
          savedCardId: inputs?.selectedCardId
        })

        if (!result.success) throw new Error(result.error)

        setupPusherListenerOneTime()
      } else {
        // ── New card — confirmed client-side ──
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        const intentResult = await createPaymentIntent({
          ...basePayload,
          saveCard: inputs.saveCard
        })

        if (!intentResult.success) throw new Error(intentResult.error)

        const result = await stripe.confirmCardPayment(intentResult.clientSecret!, {
          payment_method: {
            card: cardElement,
            billing_details: { name, email: trimmedEmail }
          }
        })

        if (result.error) {
          patch({ loading: false, error: result.error.message ?? 'Payment failed' })
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
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="One-time donation form"
      className="w-full space-y-5"
    >
      {/* Preset amounts */}
      <PresetAmounts inputs={inputs} onSelect={handlePresetSelect} />

      {/* ── Custom amount ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.5} className="mb-6">
        <label
          htmlFor="custom-amount"
          className="block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2"
        >
          Custom Amount
          <span className="ml-1 text-muted-light/60 dark:text-muted-dark/60 normal-case tracking-normal font-sans">
            (min $5)
          </span>
        </label>
        <div className="relative">
          <span
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-quicksand font-black text-sm pointer-events-none transition-colors duration-200 ${
              inputs?.useCustom
                ? 'text-primary-light dark:text-primary-dark'
                : 'text-muted-light dark:text-muted-dark'
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
            value={inputs?.customAmount ? formatWithCommas(inputs.customAmount) : ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              patch({ customAmount: raw, useCustom: true, selectedAmount: null })
            }}
            onFocus={() => {
              setAmountBlurred(false)
              patch({ useCustom: true, selectedAmount: null })
            }}
            onBlur={() => setAmountBlurred(true)}
            aria-describedby="custom-amount-hint"
            className={`
              w-full pl-8 pr-4 py-3 text-sm font-quicksand font-bold border-2 bg-surface-light dark:bg-surface-dark
              text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50
              transition-colors duration-200 focus:outline-none
              ${inputs?.useCustom ? 'border-primary-light dark:border-primary-dark' : 'border-border-light dark:border-border-dark'}
              focus-visible:border-primary-light dark:focus-visible:border-primary-dark
            `}
          />
          {inputs?.useCustom &&
            amountBlurred &&
            inputs?.customAmount &&
            parseFloat(inputs?.customAmount) < 5 && (
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
          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark ml-auto">
            one-time
          </span>
        </motion.div>
      )}

      {!isAuthed && <StepSignIn redirectTo={`/donate?donationAmount=${inputs?.selectedAmount}`} />}

      <SignedInRow />

      {isAuthed && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1.25}
          className="space-y-5"
        >
          {/* ── Name + Email ── */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
            <FormField
              id="donate-firstName"
              label="First Name"
              name="firstName"
              value={inputs?.firstName ?? ''}
              onChange={handleInput}
              placeholder="Jane"
              autoComplete="given-name"
              required
            />
            <FormField
              id="donate-lastName"
              label="Last Name"
              name="lastName"
              value={inputs?.lastName ?? ''}
              onChange={handleInput}
              placeholder="Doe"
              autoComplete="family-name"
              required
            />
          </div>
          {/* ── Email ── */}
          <FormField
            id="donate-email"
            label="Email Address"
            name="email"
            type="email"
            value={inputs?.email ?? ''}
            onChange={handleInput}
            placeholder="jane@example.com"
            autoComplete="email"
            required
            disabled={isAuthed}
            readOnly={isAuthed}
            hint={isAuthed ? 'Using your signed-in account email.' : undefined}
          />

          {/* Saved cards */}
          {isAuthed && (
            <SavedCardSelector
              savedCards={savedCards}
              selectedCardId={inputs.selectedCardId}
              useNewCard={inputs.useNewCard}
              onSelectCard={(id) => patch({ selectedCardId: id, useNewCard: false })}
              onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
              onUseSavedCard={() =>
                patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })
              }
            />
          )}

          {/* ── Card element ── */}
          {enteringNewCard && (
            <CardElementField
              onChange={({ complete, error }) =>
                patch({ cardComplete: complete, error: error ?? null })
              }
            />
          )}

          {/* ── Cover fees ── */}
          <CoverFeesToggle
            checked={inputs.coverFees}
            onChange={() => patch({ coverFees: !inputs.coverFees })}
            processingFee={processingFee}
          />

          {/* Save card — donate-specific wrapper */}
          <DonateSaveCardToggle
            checked={inputs.saveCard}
            onToggle={() => patch({ saveCard: !inputs.saveCard })}
            usingNewCard={enteringNewCard}
          />

          {/* Error */}
          <FormError error={inputs.error} />

          {/* Submit */}
          <SubmitButton
            loading={inputs.loading}
            isValid={isValid}
            label={`Pay $${(inputs.coverFees ? finalAmount : donationAmount).toFixed(2)}`}
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
