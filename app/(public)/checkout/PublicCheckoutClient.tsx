'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { fadeUp } from 'lib/constants/motion.constants'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import { usePaymentProcessor } from 'lib/hooks/usePaymentProcessor.hook'
import { useDefaultCard } from 'lib/hooks/useDefaultCard.hook'
import Link from 'next/link'
import { createPaymentIntent } from 'lib/actions/_stripe/createPaymentIntent'
import { IPaymentMethod } from 'types/payment-method.types'
import { IAddress } from 'types/address.types'
import { StepIndicator } from 'components/features/payment/StepIndicator'
import { SignedInRow } from 'components/features/payment/SignedInRow'
import { StepSignIn } from 'components/features/payment/SignInStep'
import { OrderSummary, Step2Name, Step3Address, Step4Payment } from './_components'
import { getOrderType } from './_lib/getOrderType'
import { useCartStore } from 'stores/cart.store'
import { calculateStripeFees } from 'lib/utils/fees.utils'

interface CheckoutFormInputs {
  // identity
  firstName: string
  lastName: string
  email: string
  // address
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipPostalCode: string
  useSavedAddress: boolean
  // card
  cardComplete: boolean
  selectedCardId: string | null
  useNewCard: boolean
  saveCard: boolean
  // fees
  coverFees: boolean
  // ui
  loading: boolean
  error: string | null
}

type Props = {
  savedCards: IPaymentMethod[]
  userAddress: IAddress | null
  userName: { firstName: string; lastName: string } | null
  // from server page — no useSession() flash
  isAuthed: boolean
  email: string | null
}

// ─── Step validation ──────────────────────────────────────────────────────────

type ErrorMap = Record<string, string>

const validateName = (
  inputs: CheckoutFormInputs,
  setErrors: (e: ErrorMap) => void,
  isAuthed: boolean
): boolean => {
  const errs: ErrorMap = {}
  if (!inputs.firstName.trim()) errs.firstName = 'Required'
  if (!inputs.lastName.trim()) errs.lastName = 'Required'
  if (!isAuthed) {
    if (!inputs.email.trim()) errs.email = 'Required'
    else if (!EMAIL_REGEX.test(inputs.email)) errs.email = 'Invalid email'
  }
  setErrors(errs)
  return Object.keys(errs).length === 0
}

const validateAddress = (inputs: CheckoutFormInputs, setErrors: (e: ErrorMap) => void): boolean => {
  const errs: ErrorMap = {}
  if (!inputs.addressLine1.trim()) errs.address = 'Required'
  if (!inputs.city.trim()) errs.city = 'Required'
  if (!inputs.state) errs.state = 'Required'
  if (!inputs.zipPostalCode.trim()) errs.zipPostalCode = 'Required'
  setErrors(errs)
  return Object.keys(errs).length === 0
}

export function PublicCheckoutClient({
  savedCards,
  userAddress,
  userName,
  isAuthed,
  email
}: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const { setupPusherListenerOneTime } = usePaymentProcessor()
  const items = useCartStore((s) => s.items)

  // ── Local form state ──────────────────────────────────────────────────────
  const [inputs, setInputs] = useState<CheckoutFormInputs>({
    firstName: userName?.firstName ?? '',
    lastName: userName?.lastName ?? '',
    email: email ?? '',
    addressLine1: userAddress?.addressLine1 ?? '',
    addressLine2: userAddress?.addressLine2 ?? '',
    city: userAddress?.city ?? '',
    state: userAddress?.state ?? '',
    zipPostalCode: userAddress?.zipPostalCode ?? '',
    useSavedAddress: !!userAddress,
    cardComplete: false,
    selectedCardId: savedCards[0]?.stripePaymentId ?? null,
    useNewCard: savedCards.length === 0,
    saveCard: false,
    coverFees: true,
    loading: false,
    error: null
  })

  const patch = (data: Partial<CheckoutFormInputs>) => setInputs((prev) => ({ ...prev, ...data }))

  // Separate errors map — field-level, not in the inputs blob
  const [errors, setErrors] = useState<ErrorMap>({})

  // ── Cart derived values ───────────────────────────────────────────────────
  const hasPhysical = items.some((i) => i.isPhysicalProduct)
  const hasName = !!userName?.firstName?.trim()

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = items
    .filter((i) => i.isPhysicalProduct)
    .reduce((sum, i) => sum + (i.shippingPrice ?? 0), 0)
  const baseAmount = total + shipping
  const processingFee = calculateStripeFees(baseAmount)
  const feesCovered = inputs.coverFees ? processingFee : 0
  const finalAmount = Math.round((baseAmount + feesCovered) * 100) / 100

  // ── Step machine ──────────────────────────────────────────────────────────
  const FLOW: number[] = hasPhysical ? [1, 2, 3, 4] : [1, 2, 4]
  const stepLabels = hasPhysical
    ? ['Sign In', 'Your Name', 'Shipping', 'Payment']
    : ['Sign In', 'Your Name', 'Payment']

  const [step, setStep] = useState<number>(() => {
    if (!isAuthed) return 1
    if (!hasName) return 2
    if (!hasPhysical) return 4
    return userAddress ? 4 : 3
  })

  const effectiveStep = isAuthed && step === 1 ? 2 : step
  const flowIndex = FLOW.indexOf(effectiveStep as (typeof FLOW)[number])
  const displayStep = flowIndex + 1
  const totalSteps = FLOW.length

  const goNext = () => setStep(FLOW[Math.min(flowIndex + 1, FLOW.length - 1)])
  const goBack = () => setStep(FLOW[Math.max(flowIndex - 1, isAuthed ? 1 : 0)])

  // ── Payment derived ───────────────────────────────────────────────────────
  const usingSavedCard = !!inputs.selectedCardId && !inputs.useNewCard && isAuthed
  const isValid =
    !!inputs.firstName.trim() &&
    !!inputs.lastName.trim() &&
    EMAIL_REGEX.test(email ?? '') &&
    (usingSavedCard ? true : !!inputs.cardComplete)

  // ── Shipping address — single source for display AND submit ───────────────
  const shippingAddress = hasPhysical
    ? (() => {
        const src = inputs.useSavedAddress ? userAddress : inputs
        return {
          addressLine1: src?.addressLine1 ?? null,
          addressLine2: src?.addressLine2 ?? null,
          city: src?.city ?? null,
          state: src?.state ?? null,
          zipPostalCode: src?.zipPostalCode ?? null,
          country: 'US'
        }
      })()
    : null

  const formattedShippingAddress = shippingAddress
    ? [
        shippingAddress.addressLine1,
        shippingAddress.addressLine2,
        shippingAddress.city,
        shippingAddress.state
      ]
        .filter(Boolean)
        .join(', ') + (shippingAddress.zipPostalCode ? ` ${shippingAddress.zipPostalCode}` : '')
    : ''

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [])
  useDefaultCard(savedCards, setDefaultCard)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => patch({ [e.target.name]: e.target.value } as Partial<CheckoutFormInputs>)

  const handleNext = () => {
    if (effectiveStep === 2 && !validateName(inputs, setErrors, isAuthed)) return
    if (effectiveStep === 3 && !inputs.useSavedAddress && !validateAddress(inputs, setErrors))
      return
    setErrors({})
    goNext()
  }

  const handleBack = () => {
    setErrors({})
    goBack()
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!stripe || !elements || !isValid) return

    patch({ loading: true, error: null })

    try {
      const name = `${inputs.firstName.trim()} ${inputs.lastName.trim()}`
      const trimmedEmail = email.trim()
      const amountInCents = Math.round(finalAmount * 100)

      const basePayload = {
        amount: amountInCents,
        name,
        email: trimmedEmail,
        orderType: getOrderType(items),
        coverFees: inputs.coverFees,
        feesCovered,
        items,
        ...(shippingAddress != null && { address: shippingAddress })
      }

      if (usingSavedCard) {
        const result = await createPaymentIntent({
          ...basePayload,
          savedCardId: inputs.selectedCardId
        })
        if (!result.success) throw new Error(result.error)

        setupPusherListenerOneTime()
      } else {
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        const intentResult = await createPaymentIntent({
          ...basePayload,
          saveCard: inputs.saveCard
        })
        if (!intentResult.success) throw new Error(intentResult.error)

        const result = await stripe.confirmCardPayment(intentResult.data.clientSecret!, {
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
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* Page header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-10 sm:mb-12"
        >
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="square"
              aria-hidden="true"
            >
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            Cart
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Little Paws Dachshund Rescue
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight">
            Checkout{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">& Donate</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 lg:gap-16 items-start">
          {/* Form column */}
          <div>
            <StepIndicator current={displayStep} total={totalSteps} labels={stepLabels} />

            {isAuthed && email && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.5}
                className="mb-8 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
              >
                <SignedInRow />

                {effectiveStep === 4 && hasPhysical && userAddress && (
                  <div className="flex items-start gap-3 px-4 py-3 border-t border-border-light dark:border-border-dark">
                    <div
                      className="shrink-0 w-6 h-6 flex items-center justify-center bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 mt-0.5"
                      aria-hidden="true"
                    >
                      <span className="text-[9px] font-mono font-bold text-primary-light dark:text-primary-dark uppercase">
                        @
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                        Ships to
                      </p>
                      <p className="text-xs font-mono text-text-light dark:text-text-dark">
                        {formattedShippingAddress}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {effectiveStep === 1 && <StepSignIn key="signin" redirectTo="/checkout" />}

              {effectiveStep === 2 && (
                <Step2Name
                  key="name"
                  inputs={inputs}
                  errors={errors}
                  handleInput={handleInput}
                  onNext={handleNext}
                  isAuthed={isAuthed}
                />
              )}

              {effectiveStep === 3 && hasPhysical && (
                <Step3Address
                  key="address"
                  inputs={inputs}
                  errors={errors}
                  handleInput={handleInput}
                  onNext={handleNext}
                  onBack={handleBack}
                  userAddress={userAddress}
                  useSaved={inputs.useSavedAddress}
                  setUseSaved={(value) => patch({ useSavedAddress: value })}
                  onUseDifferentAddress={() =>
                    patch({
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      zipPostalCode: ''
                    })
                  }
                  onUseSavedAddress={() =>
                    patch({
                      addressLine1: userAddress?.addressLine1 ?? '',
                      addressLine2: userAddress?.addressLine2 ?? '',
                      city: userAddress?.city ?? '',
                      state: userAddress?.state ?? '',
                      zipPostalCode: userAddress?.zipPostalCode ?? ''
                    })
                  }
                />
              )}

              {effectiveStep === 4 && (
                <Step4Payment
                  key="payment"
                  inputs={inputs}
                  patch={patch}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                  savedCards={savedCards}
                  processingFee={processingFee}
                  finalAmount={finalAmount}
                  isValid={isValid}
                  isAuthed={isAuthed}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Order summary column */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <OrderSummary
              items={items}
              finalAmount={finalAmount}
              total={total}
              coverFees={inputs.coverFees}
              step={effectiveStep}
              shipping={shipping}
            />
          </motion.div>
        </div>
      </div>
    </main>
  )
}
