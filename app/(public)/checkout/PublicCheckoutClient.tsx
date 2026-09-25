'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import Link from 'next/link'
import { IPaymentMethod } from 'types/payment-method.types'
import { IAddress } from 'types/address.types'
import { StepIndicator } from 'components/features/payment/StepIndicator'
import { SignedInRow } from 'components/features/payment/SignedInRow'
import { StepSignIn } from 'components/features/payment/SignInStep'
import { OrderSummary, Step2Name, Step3Address, Step4Payment } from './_components'
import { getOrderType } from './_lib/getOrderType'
import { useCartStore } from 'stores/cart.store'
import { checkoutSchema, CheckoutFormInput, CheckoutFormValues } from 'lib/schemas/checkout.schema'
import { useCheckoutSteps } from '@hooks/useCheckoutSteps.hook'
import { useCheckoutTotals } from '@hooks/useCheckoutTotals.hook'
import { useStripeCheckout } from '@hooks/useStripeCheckout.hook'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSignOut.hook'

type Props = {
  savedCards: IPaymentMethod[]
  userAddress: IAddress | null
  userName: { firstName: string; lastName: string } | null
  // from server page — no useSession() flash
  isAuthed: boolean
  email: string | null
  userId: string | null
}

export function PublicCheckoutClient({ savedCards, userAddress, userName, isAuthed, email, userId }: Props) {
  useRefreshOnSignOut(isAuthed)

  const items = useCartStore((s) => s.items)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    setError,
    formState: { errors }
  } = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: userName?.firstName ?? '',
      lastName: userName?.lastName ?? '',
      addressLine1: userAddress?.addressLine1 ?? '',
      addressLine2: userAddress?.addressLine2 ?? '',
      city: userAddress?.city ?? '',
      state: userAddress?.state ?? '',
      zipPostalCode: userAddress?.zipPostalCode ?? '',
      useSavedAddress: !!userAddress
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

  const { hasPhysical, total, shipping, processingFee, finalAmount } = useCheckoutTotals(items, payment.coverFees)

  const { effectiveStep, stepLabels, displayStep, totalSteps, goNext, goBack } = useCheckoutSteps({
    isAuthed,
    hasName: !!userName?.firstName?.trim(),
    hasPhysical,
    hasSavedAddress: !!userAddress
  })

  const isValid =
    !!values.firstName?.trim() &&
    !!values.lastName?.trim() &&
    EMAIL_REGEX.test(email ?? '') &&
    (usingSavedCard ? true : payment.cardComplete)

  // ── Shipping address — single source for display AND submit ───────────────
  const addressSource = values.useSavedAddress ? userAddress : values

  const shippingAddress = hasPhysical
    ? {
        addressLine1: addressSource?.addressLine1 ?? null,
        addressLine2: addressSource?.addressLine2 ?? null,
        city: addressSource?.city ?? null,
        state: addressSource?.state ?? null,
        zipPostalCode: addressSource?.zipPostalCode ?? null,
        country: 'US'
      }
    : null

  const formattedShippingAddress = shippingAddress
    ? [shippingAddress.addressLine1, shippingAddress.addressLine2, shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ') +
      (shippingAddress.zipPostalCode ? ` ${shippingAddress.zipPostalCode}` : '')
    : ''

  // ── Step navigation ───────────────────────────────────────────────────────
  const handleNext = async () => {
    if (effectiveStep === 2) {
      const ok = await trigger(['firstName', 'lastName'])
      if (!ok) return
    }

    if (effectiveStep === 3 && !values.useSavedAddress) {
      const required: (keyof CheckoutFormInput)[] = ['addressLine1', 'city', 'state', 'zipPostalCode']
      const missing = required.filter((f) => !String(values[f] ?? '').trim())

      if (missing.length) {
        for (const f of missing) setError(f, { message: 'Required' })
        return
      }

      const ok = await trigger(required)
      if (!ok) return
    }

    goNext()
  }

  const handleBack = () => goBack()

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = () =>
    pay({
      orderType: getOrderType(items),
      coverFees: payment.coverFees,
      items,
      ...(shippingAddress != null && { address: shippingAddress })
    })

  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* Page header */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10 sm:mb-12">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
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
            <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
            <p className="text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
              Little Paws Dachshund Rescue
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight">
            Checkout <span className="font-light text-muted-light dark:text-muted-dark">& Donate</span>
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
                      <span className="text-[9px] font-mono font-bold text-primary-light dark:text-primary-dark uppercase">@</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark">Ships to</p>
                      <p className="text-xs font-mono text-text-light dark:text-text-dark">{formattedShippingAddress}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {effectiveStep === 1 && <StepSignIn key="signin" redirectTo="/checkout" />}

              {effectiveStep === 2 && <Step2Name key="name" register={register} errors={errors} control={control} onNext={handleNext} />}

              {effectiveStep === 3 && hasPhysical && (
                <Step3Address
                  key="address"
                  register={register}
                  control={control}
                  errors={errors}
                  onNext={handleNext}
                  onBack={handleBack}
                  userAddress={userAddress}
                  useSaved={values.useSavedAddress ?? false}
                  setUseSaved={(value) => setValue('useSavedAddress', value)}
                  onUseDifferentAddress={() => {
                    setValue('addressLine1', '')
                    setValue('addressLine2', '')
                    setValue('city', '')
                    setValue('state', '')
                    setValue('zipPostalCode', '')
                  }}
                  onUseSavedAddress={() => {
                    setValue('addressLine1', userAddress?.addressLine1 ?? '')
                    setValue('addressLine2', userAddress?.addressLine2 ?? '')
                    setValue('city', userAddress?.city ?? '')
                    setValue('state', userAddress?.state ?? '')
                    setValue('zipPostalCode', userAddress?.zipPostalCode ?? '')
                  }}
                />
              )}

              {effectiveStep === 4 && (
                <Step4Payment
                  key="payment"
                  payment={payment}
                  patch={patch}
                  firstName={values.firstName ?? ''}
                  lastName={values.lastName ?? ''}
                  onBack={handleBack}
                  onSubmit={handleSubmit(onSubmit)}
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
              coverFees={payment.coverFees}
              step={effectiveStep}
              shipping={shipping}
            />
          </motion.div>
        </div>
      </div>
    </main>
  )
}
