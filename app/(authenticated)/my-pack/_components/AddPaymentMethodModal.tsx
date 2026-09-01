'use client'

import { useState, useRef } from 'react'
import { X, CreditCard, ShieldCheck, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { store, useUiSelector } from 'lib/store/store'
import { setCloseAddPaymentMethodModal } from 'lib/store/slices/uiSlice'
import { useEscapeKey } from 'lib/hooks/useEscapeKey.hook'
import { useRemoveScroll } from 'lib/hooks/useRemoveScroll.hook'
import { showToast } from 'lib/store/slices/toastSlice'
import { extractErrorMessage } from 'lib/utils/log.client.utils'
import { getSetupIntentClientSecret } from 'lib/actions/_stripe/getSetupIntentClientSecret'
import { createPaymentMethod } from 'lib/actions/_stripe/createPaymentMethod'

export default function AddPaymentMethodModal() {
  const { addPaymentMethodModal, isDark } = useUiSelector()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [cardholderName, setCardholderName] = useState('')
  const [cardComplete, setCardComplete] = useState(false)
  const [isDefault, setIsDefault] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onClose = () => {
    store.dispatch(setCloseAddPaymentMethodModal())
    setCardholderName('')
    setCardComplete(false)
    setIsDefault(false)
    setError(null)
    setSuccess(false)
  }

  useEscapeKey(addPaymentMethodModal, onClose)
  useRemoveScroll(addPaymentMethodModal)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      store.dispatch(
        showToast({
          type: 'error',
          message: 'Stripe not loaded',
          description: 'Please try again later.'
        })
      )
      return
    }

    setIsSubmitting(true)

    try {
      const setupRes = await getSetupIntentClientSecret()

      if (!setupRes.success || !setupRes.clientSecret) {
        throw new Error(setupRes.error || 'Failed to get client secret')
      }

      // Confirm card setup
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { setupIntent, error } = await stripe.confirmCardSetup(setupRes.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName || undefined
          }
        }
      })

      if (error) throw error

      const paymentMethodId =
        typeof setupIntent?.payment_method === 'string'
          ? setupIntent.payment_method
          : setupIntent?.payment_method?.id

      if (!paymentMethodId) throw new Error('No payment method ID returned')

      const result = await createPaymentMethod({
        stripePaymentMethodId: paymentMethodId,
        isDefault,
        cardholderName: cardholderName || undefined
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to save payment method')
      }

      router.refresh()
      setIsDefault(false)
      setCardholderName('')
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1200)
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error)

      store.dispatch(
        showToast({
          type: 'error',
          message: 'Failed to Add Payment Method',
          description: errorMessage
        })
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!addPaymentMethodModal) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-card-title"
      className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-bg-dark border border-zinc-200 dark:border-border-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Corner tick marks ── */}
        <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none z-10" aria-hidden="true">
          <div className="absolute top-0 left-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
          <div className="absolute top-0 left-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
        </div>
        <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none z-10" aria-hidden="true">
          <div className="absolute top-0 right-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
          <div className="absolute top-0 right-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
        </div>
        <div
          className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none z-10"
          aria-hidden="true"
        >
          <div className="absolute bottom-0 left-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
        </div>
        <div
          className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none z-10"
          aria-hidden="true"
        >
          <div className="absolute bottom-0 right-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
        </div>

        {/* ── Top accent bar ── */}
        <div className="relative h-0.5 w-full overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-cyan-600 dark:hidden" />
          <div className="absolute inset-0 hidden dark:block bg-linear-to-r from-violet-500 via-pink-400 to-violet-500 bg-size-[200%_100%] animate-[gradient-x_3s_ease_infinite]" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 430:p-6 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
              <span className="  text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400">
                Payment Method
              </span>
            </div>
            <h2
              id="add-card-title"
              className="  text-xl 430:text-2xl uppercase leading-none text-zinc-950 dark:text-text-dark"
            >
              Add New Card
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-muted-dark/50 dark:hover:text-text-dark dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 430:px-6 pb-6 space-y-5">
          {/* Success */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-cyan-600/10 dark:bg-violet-400/10">
                <CheckCircle
                  className="w-6 h-6 text-cyan-600 dark:text-violet-400"
                  aria-hidden="true"
                />
              </div>
              <p className="  text-sm uppercase tracking-wide text-zinc-950 dark:text-text-dark">
                Card Added
              </p>
              <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark">
                Your card has been saved successfully.
              </p>
            </div>
          ) : (
            <>
              {/* Cardholder name */}
              <div>
                <label
                  htmlFor="cardholder-name"
                  className="block   text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark mb-2"
                >
                  Cardholder Name
                </label>
                <input
                  id="cardholder-name"
                  type="text"
                  autoComplete="cc-name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Name on card"
                  className="w-full px-3.5 py-3 border-l-2 border-l-cyan-600 dark:border-l-violet-400 border-t border-r border-b border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-[#13131f] text-zinc-950 dark:text-text-dark placeholder:text-zinc-400 dark:placeholder:text-muted-dark/40 font-lato text-sm outline-none transition-all focus:border-cyan-600 dark:focus:border-violet-400"
                />
              </div>

              {/* Card element */}
              <div>
                <label
                  id="card-details-label"
                  className="block   text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark mb-2"
                >
                  Card Details
                </label>
                <div
                  role="group"
                  aria-labelledby="card-details-label"
                  className="px-3.5 py-3.5 border-l-2 border-l-cyan-600 dark:border-l-violet-400 border-t border-r border-b border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-[#13131f] transition-colors duration-200 focus-within:border-cyan-600 dark:focus-within:border-violet-400"
                >
                  <CardElement
                    onChange={(e) => {
                      setCardComplete(e.complete)
                      if (e.error) setError(e.error.message ?? null)
                      else setError(null)
                    }}
                    options={{
                      style: {
                        base: {
                          color: isDark ? '#f1f0ff' : '#09090b',
                          backgroundColor: isDark ? '#13131f' : '#f9fafb',
                          fontSize: '14px',
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          '::placeholder': { color: isDark ? '#4a4a6a' : '#a1a1aa' },
                          iconColor: isDark ? '#7c3aed' : '#0891b2'
                        },
                        invalid: { color: '#ef4444' }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Set as default toggle */}
              <div>
                <label
                  id="options-label"
                  className="block   text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark mb-2"
                >
                  Options
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDefault}
                  aria-label="Set as default payment method"
                  onClick={() => setIsDefault(!isDefault)}
                  className="w-full flex items-center justify-between p-4 border border-zinc-200 dark:border-border-dark hover:border-cyan-600/40 dark:hover:border-violet-400/40 bg-zinc-50 dark:bg-[#13131f] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard
                      className="w-4 h-4 text-zinc-400 dark:text-muted-dark/50 shrink-0"
                      aria-hidden="true"
                    />
                    <div className="text-left">
                      <p className="  text-sm uppercase tracking-wide leading-none mb-0.5 text-zinc-950 dark:text-text-dark">
                        Set as default
                      </p>
                      <p className="font-lato text-xs text-zinc-400 dark:text-muted-dark/50">
                        Use this card for future payments
                      </p>
                    </div>
                  </div>
                  <div
                    aria-hidden="true"
                    className={`relative w-10 h-5 transition-colors duration-200 shrink-0 ${
                      isDefault
                        ? 'bg-cyan-600 dark:bg-violet-500'
                        : 'bg-zinc-300 dark:bg-border-dark'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white transition-transform duration-200 ${
                        isDefault ? 'translate-x-0.5' : '-translate-x-4.5'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-dark/50 shrink-0"
                  aria-hidden="true"
                />
                <p className="font-lato text-xs text-zinc-400 dark:text-muted-dark/50">
                  Your card is secured and encrypted by Stripe
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-3 px-4 py-3 border-l-2 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-400/5 text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="font-lato text-xs leading-relaxed">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!cardComplete || isSubmitting}
                aria-disabled={!cardComplete || isSubmitting}
                className="group relative w-full overflow-hidden   uppercase tracking-widest disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-bg-dark"
              >
                <span
                  className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.4s_ease_infinite] pointer-events-none z-10"
                  aria-hidden="true"
                />
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3 px-6 py-3.5 bg-cyan-600 dark:bg-violet-500 text-white text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Saving...</span>
                    <span className="sr-only">Please wait</span>
                  </div>
                ) : (
                  <div className={`flex disabled:opacity-40 ${!cardComplete ? 'opacity-40' : ''}`}>
                    <div className="flex-1 flex items-center justify-center px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 dark:bg-violet-500 dark:hover:bg-violet-400 text-white text-sm transition-colors duration-200">
                      Save Card
                    </div>
                  </div>
                )}
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={onClose}
                className="w-full px-6 py-3   text-[10px] uppercase tracking-widest border border-zinc-200 hover:border-cyan-600/30 hover:bg-zinc-50 dark:border-border-dark dark:hover:border-violet-400/30 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
