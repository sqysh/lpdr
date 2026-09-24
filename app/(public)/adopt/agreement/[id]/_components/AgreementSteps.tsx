'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormError, FormField, Line, SubmitButton } from 'components/_primitives'
import { formatMoney } from 'lib/utils/currency.utils'
import {
  adopterDetailsSchema,
  signFinancialSchema,
  signTermsSchema,
  type AdopterDetailsInput,
  type AdopterDetailsValues,
  type SignFinancialInput,
  type SignFinancialValues,
  type SignTermsInput,
  type SignTermsValues
} from 'lib/schemas/adoption-agreement.schema'
import { signAgreementFinancial } from 'lib/actions/user/adoption-agreement/signAgreementFinancial'
import { saveAdopterDetails } from 'lib/actions/user/adoption-agreement/saveAdopterDetails'
import { signAgreementTerms } from 'lib/actions/user/adoption-agreement/signAgreementTerms'
import { formatPhone } from 'lib/utils/phone.utils'
import { useStepSubmit } from '../_lib/useStepSubmit.hook'
import { AgreeCheckbox, Heading } from './AgreementPrimitives'
import { AgreementDocument } from './AgreementDcoument'
import { AgreementData } from '../AdoptionAgreementClient'
import { MONEY_PATTERN } from 'lib/constants/regex.constants'

export type StepProps = { data: AgreementData; loadedAt: string }

export function DetailsStep({ data }: StepProps) {
  const a = data.agreement
  const { error, run, isRefreshing } = useStepSubmit()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<AdopterDetailsInput, unknown, AdopterDetailsValues>({
    resolver: zodResolver(adopterDetailsSchema),
    defaultValues: {
      firstName: a.firstName ?? '',
      lastName: a.lastName ?? '',
      phone: formatPhone(a.phone ?? ''),
      addressLine1: a.addressLine1 ?? '',
      addressLine2: a.addressLine2 ?? '',
      city: a.city ?? '',
      state: a.state ?? '',
      zipPostalCode: a.zipPostalCode ?? ''
    }
  })

  return (
    <form onSubmit={handleSubmit(() => run(() => saveAdopterDetails(a.id, getValues())))} noValidate className="space-y-6">
      <Heading eyebrow="Step 1 of 3" title="Confirm your details">
        These appear on the agreement, so make sure they&apos;re right. They&apos;re also saved to your account.
      </Heading>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          id="firstName"
          label="First name"
          autoComplete="given-name"
          required
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <FormField
          id="lastName"
          label="Last name"
          autoComplete="family-name"
          required
          {...register('lastName')}
          error={errors.lastName?.message}
        />
      </div>
      <FormField
        id="phone"
        label="Phone"
        type="tel"
        autoComplete="tel"
        format={formatPhone}
        maxLength={14}
        required
        {...register('phone')}
        error={errors.phone?.message}
      />
      <FormField
        id="addressLine1"
        label="Street address"
        autoComplete="address-line1"
        required
        {...register('addressLine1')}
        error={errors.addressLine1?.message}
      />
      <FormField
        id="addressLine2"
        label="Apartment, suite, etc."
        autoComplete="address-line2"
        {...register('addressLine2')}
        error={errors.addressLine2?.message}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField id="city" label="City" autoComplete="address-level2" required {...register('city')} error={errors.city?.message} />
        <FormField id="state" label="State" autoComplete="address-level1" required {...register('state')} error={errors.state?.message} />
        <FormField
          id="zipPostalCode"
          label="ZIP"
          autoComplete="postal-code"
          inputMode="numeric"
          required
          {...register('zipPostalCode')}
          error={errors.zipPostalCode?.message}
        />
      </div>

      <FormError error={error} />
      <SubmitButton loading={isSubmitting || isRefreshing} isValid label="Continue to the agreement" />
    </form>
  )
}

export function TermsStep({ data, loadedAt }: StepProps) {
  const a = data.agreement
  const { error, run, isRefreshing } = useStepSubmit()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<SignTermsInput, unknown, SignTermsValues>({
    resolver: zodResolver(signTermsSchema),
    defaultValues: { agreementId: a.id, loadedAt, typedName: '', agreed: false }
  })

  return (
    <div className="space-y-10">
      <Heading eyebrow="Step 2 of 3" title={`Adopting ${a.dogName}`}>
        Please read the whole agreement, including {a.dogName}&apos;s medical details. If anything looks wrong, reply to your agreement
        email before signing and we&apos;ll correct it.
      </Heading>

      <AgreementDocument data={data} />

      <form
        onSubmit={handleSubmit(() => run(() => signAgreementTerms({ ...getValues(), loadedAt })))}
        noValidate
        className="space-y-5 p-5 border-2 border-primary-light/40 dark:border-primary-dark/40 bg-surface-light dark:bg-surface-dark"
      >
        <AgreeCheckbox
          id="agreed"
          label="I/We agree to statements 1 through 20 above."
          {...register('agreed')}
          error={errors.agreed?.message}
        />
        <FormField
          id="typedName"
          label="Type your full name to sign"
          autoComplete="name"
          placeholder={[a.firstName, a.lastName].filter(Boolean).join(' ')}
          inputClassName="font-signature! text-2xl! py-2!"
          required
          {...register('typedName')}
          error={errors.typedName?.message}
        />
        <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
          Typing your name is your legal signature. We record the date and time you sign along with your account.
        </p>

        <FormError error={error} />
        <SubmitButton loading={isSubmitting || isRefreshing} isValid label="Sign and continue" />
      </form>
    </div>
  )
}

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

  const paysByCard = a.paymentMethod === 'CARD'

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

      <p className="px-4 py-3 border-l-2 border-primary-light dark:border-primary-dark bg-surface-light dark:bg-surface-dark text-sm text-muted-light dark:text-muted-dark leading-relaxed">
        {paysByCard ? (
          <>
            You&apos;ll pay by card right after signing. Prefer Zelle, Venmo or PayPal? Reply to your agreement email{' '}
            <strong className="text-text-light dark:text-text-dark">before signing</strong> and we&apos;ll update it.
          </>
        ) : (
          <>
            You&apos;ll pay by <strong className="text-text-light dark:text-text-dark">{data.paymentInstructions?.label}</strong>. The
            details appear right after you sign.
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
