'use client'

import type { PaymentState } from 'lib/hooks/useStripeCheckout.hook'
import type { IPaymentMethod } from 'types/payment-method.types'
import { FormError, SubmitButton, Toggle } from 'components/_primitives'
import { SavedCardSelector } from './SavedCardSelector'
import { CoverFeesToggle } from './CoverFeesToggle'
import { CardElementField } from './CardElementField'
import { StripeSecurityNote } from './StripeSecurityNote'

type Props = {
  payment: PaymentState
  patch: (data: Partial<PaymentState>) => void
  savedCards: IPaymentMethod[]
  processingFee: number
  isValid: boolean
  submitLabel: string
  submitPrice?: number
  /** Subscriptions save the card by necessity, so they hide the toggle. */
  showSaveCard?: boolean
  saveCardLabel?: string
  saveCardDescription?: string
  securityNoteExtra?: string
  onSubmit?: (e: { preventDefault: () => void }) => void
}

export function PaymentSection({
  payment,
  patch,
  savedCards,
  processingFee,
  isValid,
  submitLabel,
  submitPrice,
  showSaveCard = true,
  saveCardLabel = 'Save card for future purchases',
  saveCardDescription = 'One-click checkout next time',
  securityNoteExtra,
  onSubmit
}: Props) {
  const enteringNewCard = savedCards.length === 0 || payment.useNewCard

  return (
    <div className="space-y-4">
      {savedCards.length > 0 && (
        <SavedCardSelector
          savedCards={savedCards}
          selectedCardId={payment.selectedCardId}
          useNewCard={payment.useNewCard}
          onSelectCard={(id) => patch({ selectedCardId: id, useNewCard: false })}
          onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
          onUseSavedCard={() => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })}
        />
      )}

      {enteringNewCard && (
        <>
          <CardElementField onChange={({ complete, error }) => patch({ cardComplete: complete, error: error ?? null })} />

          {showSaveCard && (
            <Toggle
              id="payment-save-card"
              label={saveCardLabel}
              description={saveCardDescription}
              checked={payment.saveCard}
              onToggle={() => patch({ saveCard: !payment.saveCard })}
            />
          )}
        </>
      )}

      <CoverFeesToggle
        checked={payment.coverFees}
        onChange={() => patch({ coverFees: !payment.coverFees })}
        processingFee={processingFee}
      />

      <FormError error={payment.error} />

      <SubmitButton loading={payment.loading} isValid={isValid} label={submitLabel} price={submitPrice} onClick={onSubmit} />

      <StripeSecurityNote extra={securityNoteExtra} />
    </div>
  )
}
