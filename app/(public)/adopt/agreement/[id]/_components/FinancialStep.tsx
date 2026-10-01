'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormError, FormField, Line, SubmitButton } from 'components/_primitives'
import { formatMoney } from 'lib/utils/currency.utils'
import { signFinancialSchema, type SignFinancialInput, type SignFinancialValues } from 'lib/schemas/adoption-agreement.schema'
import { signAgreementFinancial } from 'lib/actions/user/adoption-agreement/signAgreementFinancial'
import { useStepSubmit } from '../_lib/useStepSubmit.hook'
import { AgreeCheckbox, Heading, StepProps } from './AgreementPrimitives'
import { MONEY_PATTERN } from 'lib/constants/regex.constants'
import { AdoptionPaymentMethod } from '@prisma/client'
import { OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'

const PAYMENT_OPTIONS: { value: AdoptionPaymentMethod; label: string; detail: string }[] = [
  { value: 'CARD', label: 'Card', detail: 'Pay on this page right after signing' },
  ...Object.entries(OFFLINE_PAYMENT_INSTRUCTIONS).map(([value, { label }]) => ({
    value: value as AdoptionPaymentMethod,
    label,
    detail: 'Details appear right after you sign'
  }))
]

export function FinancialStep({ data, loadedAt }: StepProps) {
  const a = data.agreement
  const { error, run, isRefreshing } = useStepSubmit()

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors, isSubmitting }
  } = useForm<SignFinancialInput, unknown, SignFinancialValues>({
    resolver: zodResolver(signFinancialSchema),
    defaultValues: {
      agreementId: a.id,
      loadedAt,
      paymentMethod: a.paymentMethod ?? 'CARD',
      firstAdopterName: '',
      secondAdopterName: '',
      // Kept if they come back to this step, so a donation they chose isn't silently dropped
      additionalDonation: a.additionalDonation ? Number(a.additionalDonation).toFixed(2) : '',
      agreed: false
    }
  })

  const donationInput = useWatch({ control, name: 'additionalDonation' })
  const donation = MONEY_PATTERN.test(donationInput ?? '') ? Number(donationInput) : 0
  const healthCertificate = Number(a.healthCertificateFee ?? 0)
  const total = Number(a.adoptionFee) + healthCertificate + donation

  const paymentMethod = useWatch({ control, name: 'paymentMethod' })
  const paysByCard = paymentMethod === 'CARD'
  const offlineLabel = paymentMethod && paymentMethod !== 'CARD' ? OFFLINE_PAYMENT_INSTRUCTIONS[paymentMethod].label : null

  return (
    <form onSubmit={handleSubmit(() => run(() => signAgreementFinancial({ ...getValues(), loadedAt })))} noValidate className="space-y-8">
      <Heading eyebrow="Step 3 of 3" title="Financial agreement" />

      {data.terms && <p className="text-sm leading-relaxed text-muted-light dark:text-muted-dark">{data.terms.financial}</p>}

      <FormField
        id="additionalDonation"
        label="Optional additional donation"
        inputMode="decimal"
        placeholder="0.00"
        {...register('additionalDonation')}
        hint="Tax deductible. Helps the dogs still in our care"
        error={errors.additionalDonation?.message}
      />

      <dl className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
        <Line label="Adoption fee" value={formatMoney(a.adoptionFee)} />
        {healthCertificate > 0 && <Line label="Health certificate" value={formatMoney(healthCertificate)} />}
        {donation > 0 && <Line label="Your additional donation" value={formatMoney(donation)} accent />}
        <div className="flex items-end justify-between gap-4 px-4 py-3">
          <dt className="text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark">Total due</dt>
          <dd className="font-quicksand font-bold text-3xl tabular-nums text-primary-light dark:text-primary-dark">{formatMoney(total)}</dd>
        </div>
      </dl>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark">
          How would you like to pay?
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 px-4 py-3 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark cursor-pointer transition-colors has-checked:border-primary-light dark:has-checked:border-primary-dark has-checked:bg-primary-light/5 dark:has-checked:bg-primary-dark/5 has-focus-visible:ring-2 has-focus-visible:ring-primary-light dark:has-focus-visible:ring-primary-dark"
            >
              <input
                type="radio"
                value={option.value}
                {...register('paymentMethod')}
                className="mt-1 accent-primary-light dark:accent-primary-dark"
              />
              <span>
                <span className="block text-sm font-bold text-text-light dark:text-text-dark">{option.label}</span>
                <span className="block text-[11px] font-mono text-muted-light dark:text-muted-dark">{option.detail}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.paymentMethod?.message && (
          <p role="alert" className="text-[11px] font-mono text-red-500 dark:text-red-400">
            {errors.paymentMethod.message}
          </p>
        )}
      </fieldset>

      <p className="px-4 py-3 border-l-2 border-primary-light dark:border-primary-dark bg-surface-light dark:bg-surface-dark text-sm text-muted-light dark:text-muted-dark leading-relaxed">
        {paysByCard ? (
          <>You&apos;ll pay by card on the next screen, right after signing.</>
        ) : (
          <>
            You&apos;ll pay by <strong className="text-text-light dark:text-text-dark">{offlineLabel}</strong>. We&apos;ll show the details
            right after you sign and email them to you too.
          </>
        )}
      </p>

      <div className="space-y-5 p-5 border border-primary-light/40 dark:border-primary-dark/40 bg-surface-light dark:bg-surface-dark">
        <AgreeCheckbox
          id="financial-agreed"
          label="I/We agree to the financial terms above."
          {...register('agreed')}
          error={errors.agreed?.message}
        />
        <FormField
          id="firstAdopterName"
          label="First adopter: type your full name to sign"
          autoComplete="name"
          placeholder={[a.firstName, a.lastName].filter(Boolean).join(' ')}
          inputClassName="font-signature! text-2xl! py-2!"
          required
          {...register('firstAdopterName')}
          error={errors.firstAdopterName?.message}
        />
        <FormField
          id="secondAdopterName"
          label="Second adopter, if applicable"
          inputClassName="font-signature! text-2xl! py-2!"
          {...register('secondAdopterName')}
          hint="Leave blank if you're adopting on your own"
          error={errors.secondAdopterName?.message}
        />
        <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
          Typing your name is your legal signature. We record the date and time you sign along with your account.
        </p>
        <FormError error={error} />
        <SubmitButton
          loading={isSubmitting || isRefreshing}
          isValid
          label={paysByCard ? 'Sign and continue to payment' : 'Sign agreement'}
        />
      </div>
    </form>
  )
}
