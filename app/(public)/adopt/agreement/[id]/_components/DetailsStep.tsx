import { useForm } from 'react-hook-form'
import { useStepSubmit } from '../_lib/useStepSubmit.hook'
import { Heading, StepProps } from './AgreementPrimitives'
import { AdopterDetailsInput, adopterDetailsSchema, AdopterDetailsValues } from 'lib/schemas/adoption-agreement.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatPhone } from 'lib/utils/phone.utils'
import { saveAdopterDetails } from 'lib/actions/user/adoption-agreement/saveAdopterDetails'
import { FormError, FormField, SubmitButton } from 'components/_primitives'

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
