import { OrderType } from '@prisma/client'
import { IPaymentMethod } from 'types/payment-method.types'
import { AdoptionSaveCardToggle } from './AdoptionSaveCardToggle'
import { FormError, SubmitButton } from 'components/_primitives'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { CardElementField } from 'components/features/payment/CardElementField'
import { ADOPTION_FEE_DOLLARS } from 'lib/constants/adoption-fees.constants'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { useStripeCheckout } from '@hooks/useStripeCheckout.hook'

type Props = {
  savedCards: IPaymentMethod[]
  isAuthed: boolean
  firstName: string
  lastName: string
  email: string | null
  userId: string | null
}

export function PreApp4PaymentForm({ savedCards, isAuthed, firstName, lastName, email, userId }: Props) {
  const { payment, patch, usingSavedCard, pay } = useStripeCheckout({
    savedCards,
    isAuthed,
    userId,
    billingName: `${firstName.trim()} ${lastName.trim()}`,
    billingEmail: email ?? ''
  })

  const processingFee = calculateStripeFees(ADOPTION_FEE_DOLLARS)
  const finalAmount = payment.coverFees ? ADOPTION_FEE_DOLLARS + processingFee : ADOPTION_FEE_DOLLARS
  const enteringNewCard = !isAuthed || savedCards.length === 0 || payment.useNewCard

  const isValid = usingSavedCard ? true : payment.cardComplete

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    pay({
      orderType: 'ADOPTION_FEE' as OrderType,
      coverFees: payment.coverFees
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Adoption fee form" className="space-y-6">
      {/* ── Saved cards ── */}
      {isAuthed && (
        <SavedCardSelector
          savedCards={savedCards}
          selectedCardId={payment.selectedCardId}
          useNewCard={payment.useNewCard}
          onSelectCard={(id) => patch({ selectedCardId: id })}
          onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
          onUseSavedCard={() => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })}
        />
      )}

      {/* ── Card element ── */}
      {enteringNewCard && <CardElementField onChange={({ complete, error }) => patch({ cardComplete: complete, error })} />}

      {/* ── Cover fees ── */}
      <CoverFeesToggle checked={payment.coverFees} onChange={(v) => patch({ coverFees: v })} processingFee={processingFee} />

      {/* ── Save card ── */}
      <AdoptionSaveCardToggle
        checked={payment.saveCard}
        onChange={(v: boolean) => patch({ saveCard: v })}
        isAuthed={isAuthed}
        selectedCardId={payment.selectedCardId}
        useNewCard={payment.useNewCard}
      />

      {/* ── Error ── */}
      <FormError error={payment.error} />

      {/* ── Submit ── */}
      <SubmitButton
        loading={payment.loading}
        isValid={isValid}
        label={`Pay $${payment.coverFees ? finalAmount.toFixed(2) : ADOPTION_FEE_DOLLARS.toFixed(2)}`}
      />

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
        Secured by Stripe. We never store your card details. All donations are final and non-refundable.
      </p>
    </form>
  )
}
