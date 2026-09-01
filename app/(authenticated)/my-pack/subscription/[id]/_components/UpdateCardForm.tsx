'use client'

import { updateSubscriptionPaymentMethod } from 'lib/actions/_stripe/updateSubscriptionPaymentMethod'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useThemeStore } from 'stores/theme.store'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FormError } from 'components/_primitives'

const fieldLabel =
  'block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2'

const buttonBase =
  'py-3 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

export function UpdateCardForm({
  subscriptionId,
  onSuccess,
  onCancel
}: {
  subscriptionId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const isDark = useThemeStore((s) => s.isDark)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      })

      if (stripeError) throw new Error(stripeError.message)

      const result = await updateSubscriptionPaymentMethod({
        subscriptionId,
        paymentMethodId: paymentMethod!.id
      })

      if (!result.success) throw new Error(result.error ?? 'Failed to update card')

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label id="update-card-label" className={fieldLabel}>
          New Card Details
        </label>
        <div
          role="group"
          aria-labelledby="update-card-label"
          className="px-3.5 py-3.5 border-2 border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transition-colors duration-200 focus-within:border-primary-light dark:focus-within:border-primary-dark"
        >
          <CardElement
            onChange={(e) => {
              setCardComplete(e.complete)
              setError(e.error?.message ?? null)
            }}
            options={{
              style: {
                base: {
                  color: isDark ? '#f1f0ff' : '#09090b',
                  backgroundColor: 'transparent',
                  fontSize: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  '::placeholder': { color: isDark ? '#4a4a6a' : '#a1a1aa' }
                },
                invalid: { color: '#ef4444' }
              }
            }}
          />
        </div>
      </div>

      <FormError error={error} />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={`${buttonBase} px-5 border-2 border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-text-light dark:hover:text-text-dark disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          disabled={!cardComplete || loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className={`${buttonBase} flex-1 flex items-center justify-center gap-2 ${
            loading
              ? 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-2 border-border-light dark:border-border-dark cursor-not-allowed'
              : 'bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white cursor-pointer'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full"
                aria-hidden="true"
              />
              Updating...
            </span>
          ) : (
            'Update Card'
          )}
        </motion.button>
      </div>
    </form>
  )
}
