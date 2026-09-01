'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { fadeUp } from 'lib/constants/motion.constants'
import type { IPaymentMethod } from 'types/_payment-method.types'
import { FormError, Toggle } from 'components/_primitives'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { CardElementField } from 'components/features/payment/CardElementField'

interface CheckoutFormInputs {
  // identity
  firstName?: string
  lastName?: string
  email?: string

  // shipping
  useSavedAddress?: boolean
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zipPostalCode?: string

  // payment
  selectedCardId?: string | null
  useNewCard?: boolean
  saveCard?: boolean
  coverFees?: boolean
  cardComplete?: boolean

  // submission lifecycle
  loading?: boolean
  error?: string | null
  processingStatus?: string
}

interface Props {
  inputs: CheckoutFormInputs
  patch: (data: Partial<CheckoutFormInputs>) => void
  onBack: () => void
  onSubmit: (e: { preventDefault: () => void }) => void | Promise<void>
  savedCards: IPaymentMethod[]
  processingFee: number
  finalAmount: number
  isValid: boolean // passed from parent — no re-derivation here
  isAuthed: boolean // passed from parent — kills useSession
}

export function Step4Payment({
  inputs,
  patch,
  onBack,
  onSubmit,
  savedCards,
  processingFee,
  finalAmount,
  isValid,
  isAuthed
}: Props) {
  const loading = !!inputs.loading
  const enteringNewCard = !isAuthed || savedCards.length === 0 || inputs.useNewCard
  const isSubmitReady = isValid && !loading

  return (
    <motion.div
      key="step-payment"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Heading */}
      <div>
        <h2 className="font-quicksand text-2xl font-bold text-text-light dark:text-text-dark mb-1">
          Payment <span className="font-light text-muted-light dark:text-muted-dark">details</span>
        </h2>
        <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
          Donating as{' '}
          <span className="text-text-light dark:text-text-dark">
            {inputs.firstName} {inputs.lastName}
          </span>
        </p>
      </div>

      {/* Saved cards */}
      {isAuthed && savedCards.length > 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3.5} className="mb-6">
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
        </motion.div>
      )}

      {/* Card element */}
      {enteringNewCard && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mb-6">
          <CardElementField
            onChange={({ complete, error }) =>
              patch({ cardComplete: complete, error: error ?? null })
            }
          />
        </motion.div>
      )}

      {/* Options */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={4.5}
        className="mb-6 space-y-2"
      >
        <CoverFeesToggle
          checked={inputs.coverFees}
          onChange={() => patch({ coverFees: !inputs.coverFees })}
          processingFee={processingFee}
        />

        {isAuthed && enteringNewCard && (
          <Toggle
            id="checkout-save-card"
            label="Save card for future donations"
            description="One-click checkout next time"
            checked={inputs.saveCard}
            onToggle={() => patch({ saveCard: !inputs.saveCard })}
          />
        )}
      </motion.div>

      {/* Error */}
      <FormError error={inputs.error} />

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-4 text-[10px] font-mono tracking-[0.2em] uppercase border-2 border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-text-light dark:hover:text-text-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Back
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isSubmitReady}
          className={`flex-1 py-4 font-black text-[11px] tracking-[0.2em] uppercase font-mono transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center justify-center gap-2
            ${
              !isSubmitReady
                ? 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-2 border-border-light dark:border-border-dark cursor-not-allowed'
                : 'bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white cursor-pointer'
            }`}
        >
          {loading ? (
            <span className="flex items-center gap-2" aria-live="polite">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full"
                aria-hidden="true"
              />
              Processing...
            </span>
          ) : (
            `Pay $${finalAmount.toFixed(2)}`
          )}
        </button>
      </div>

      {/* Security note */}
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
        Secured by Stripe. We never store your card details.
      </p>
    </motion.div>
  )
}
