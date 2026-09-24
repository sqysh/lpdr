'use client'

import { SyntheticEvent, useState } from 'react'
import { useStripeCheckout } from 'lib/hooks/useStripeCheckout.hook'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CardElementField } from 'components/features/payment/CardElementField'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { StripeSecurityNote } from 'components/features/payment/StripeSecurityNote'
import { FormError, FormField, Line, SubmitButton } from 'components/_primitives'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { formatMoney } from 'lib/utils/currency.utils'
import { agreementTotal } from 'lib/utils/adoption-agreement.utils'
import { updateAgreementDonation } from 'lib/actions/user/adoption-agreement/updateAgreementDonation'
import type { IPaymentMethod } from 'types/payment-method.types'
import { MONEY_PATTERN } from 'lib/constants/regex.constants'

export function AgreementPayment({
  agreementId,
  adoptionFee,
  healthCertificateFee,
  additionalDonation,
  savedCards,
  userId,
  billingName,
  billingEmail
}: {
  agreementId: string
  adoptionFee: number
  healthCertificateFee: number | null
  additionalDonation: number | null
  savedCards: IPaymentMethod[]
  userId: string
  billingName: string
  billingEmail: string
}) {
  const { payment, patch, usingSavedCard, pay, ready } = useStripeCheckout({
    savedCards,
    isAuthed: true,
    userId,
    billingName,
    billingEmail
  })

  const saved = additionalDonation ?? 0
  const [donationInput, setDonationInput] = useState(saved > 0 ? saved.toFixed(2) : '')
  const [donationError, setDonationError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const donationValid = donationInput === '' || MONEY_PATTERN.test(donationInput)
  const donation = donationValid && donationInput ? Number(donationInput) : 0

  const total = agreementTotal({ adoptionFee, healthCertificateFee, additionalDonation: donation })
  const processingFee = calculateStripeFees(total)
  const charged = payment.coverFees ? total + processingFee : total

  const enteringNewCard = savedCards.length === 0 || payment.useNewCard
  const isValid = ready && donationValid && (usingSavedCard || payment.cardComplete)

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (saving || !donationValid) return
    setDonationError(null)

    // The server prices the payment from the agreement, so a changed donation is saved before paying
    if (donation !== saved) {
      setSaving(true)
      const result = await updateAgreementDonation({ agreementId, additionalDonation: donationInput })
      setSaving(false)

      if (!result.success) {
        setDonationError(result.error)
        return
      }
    }

    pay({ orderType: 'ADOPTION_AGREEMENT', agreementId, coverFees: payment.coverFees })
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Pay for your adoption" className="space-y-6">
      <div className="space-y-2">
        <p className="text-f10 font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">Signed</p>
        <h2 className="font-quicksand font-bold text-2xl sm:text-3xl text-text-light dark:text-text-dark">Last step: payment</h2>
        <p className="text-sm text-muted-light dark:text-muted-dark">Your agreement is signed. Pay below to complete the adoption.</p>
      </div>

      <FormField
        id="additionalDonation"
        label="Additional donation"
        name="additionalDonation"
        inputMode="decimal"
        placeholder="0.00"
        value={donationInput}
        onChange={(e) => setDonationInput(e.target.value)}
        hint="Optional and tax deductible. Change it or leave it blank"
        error={donationValid ? (donationError ?? undefined) : 'Enter an amount like 25 or 25.50'}
      />

      <dl className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
        <Line label="Adoption fee" value={formatMoney(adoptionFee)} />
        {healthCertificateFee != null && healthCertificateFee > 0 && (
          <Line label="Health certificate" value={formatMoney(healthCertificateFee)} />
        )}
        {donation > 0 && <Line label="Your additional donation" value={formatMoney(donation)} accent />}
        {payment.coverFees && <Line label="Processing fees covered" value={`+${formatMoney(processingFee)}`} />}
        <div className="flex items-end justify-between gap-4 px-4 py-3">
          <dt className="text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark">Total</dt>
          <dd className="font-quicksand font-bold text-3xl tabular-nums text-primary-light dark:text-primary-dark">
            {formatMoney(charged)}
          </dd>
        </div>
      </dl>

      <SavedCardSelector
        savedCards={savedCards}
        selectedCardId={payment.selectedCardId}
        useNewCard={payment.useNewCard}
        onSelectCard={(id) => patch({ selectedCardId: id, useNewCard: false })}
        onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
        onUseSavedCard={() => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null })}
      />

      {enteringNewCard && <CardElementField onChange={({ complete, error }) => patch({ cardComplete: complete, error: error ?? null })} />}

      <CoverFeesToggle
        checked={payment.coverFees}
        onChange={() => patch({ coverFees: !payment.coverFees })}
        processingFee={processingFee}
      />

      <FormError error={payment.error} />
      <SubmitButton loading={saving || payment.loading} isValid={isValid} label={`Pay ${formatMoney(charged)}`} />
      <StripeSecurityNote />
    </form>
  )
}
