'use client'

import { useState } from 'react'
import { Elements, ExpressCheckoutElement, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js'
import { stripePromise } from 'lib/stripe/stripe-promise'

type Props = {
  /** Dollars, including covered fees, so the wallet sheet shows exactly what the card is charged */
  amount: number
  /** Creates the payment intent for this amount and returns its client secret */
  createIntent: (payerName: string | null) => Promise<{ clientSecret: string } | { error: string }>
  onPaid: () => void
  onError: (message: string) => void
}

function ExpressButtons({ createIntent, onPaid, onError }: Omit<Props, 'amount'>) {
  const stripe = useStripe()
  const elements = useElements()
  // Only true once Stripe reports a wallet this device can use, so the divider never shows with nothing above it
  const [available, setAvailable] = useState(false)

  const onConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements) return

    // Required before creating the intent when the amount is set on Elements rather than from a client secret
    const { error: submitError } = await elements.submit()
    if (submitError) return onError(submitError.message ?? 'Payment could not be started.')

    const result = await createIntent(event.billingDetails?.name ?? null)
    if ('error' in result) {
      event.paymentFailed({ reason: 'fail' })
      return onError(result.error)
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret: result.clientSecret,
      confirmParams: { return_url: window.location.href },
      // Apple Pay and Google Pay finish in place, so there's normally no redirect
      redirect: 'if_required'
    })

    if (error) return onError(error.message ?? 'Payment failed.')
    onPaid()
  }

  return (
    <div className="space-y-4">
      <ExpressCheckoutElement
        onReady={({ availablePaymentMethods }) => setAvailable(!!availablePaymentMethods)}
        onConfirm={onConfirm}
        options={{
          buttonType: { applePay: 'donate', googlePay: 'donate' },
          buttonHeight: 48,
          // Link's button reads like a third sign-in option next to the wallets, so it's left out
          paymentMethods: {
            applePay: 'auto',
            googlePay: 'auto',
            // These redirect away and back, which this flow doesn't handle; Link reads like another sign-in option
            amazonPay: 'never',
            paypal: 'never',
            link: 'never'
          }
        }}
      />
      {available && (
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="flex-1 h-px bg-border-light dark:bg-border-dark" />
          <span className="text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark">or pay by card</span>
          <span className="flex-1 h-px bg-border-light dark:bg-border-dark" />
        </div>
      )}
    </div>
  )
}

/** Apple Pay and Google Pay, above the card form. Shows only what the visitor's device supports, or nothing */
export function ExpressPay({ amount, ...props }: Props) {
  // Stripe won't offer wallets for less than 50 cents
  if (amount < 0.5) return null

  return (
    <Elements stripe={stripePromise} options={{ mode: 'payment', amount: Math.round(amount * 100), currency: 'usd' }}>
      <ExpressButtons {...props} />
    </Elements>
  )
}
