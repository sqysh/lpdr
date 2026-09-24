'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { countersignAdoptionAgreement } from 'lib/actions/admin/adoption-agreement/countersignAdoptionAgreement'
import {
  countersignAgreementSchema,
  type CountersignAgreementInput,
  type CountersignAgreementValues
} from 'lib/schemas/adoption-agreement.schema'

export function CountersignPanel({ agreementId, signerName }: { agreementId: string; signerName: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  // Keeps the button spinning until the page reloads showing the agreement as complete
  const [isRefreshing, startRefresh] = useTransition()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<CountersignAgreementInput, unknown, CountersignAgreementValues>({
    resolver: zodResolver(countersignAgreementSchema),
    defaultValues: { agreementId, typedName: '', agreed: false }
  })

  const onSubmit = async () => {
    setError(null)
    const result = await countersignAdoptionAgreement(getValues())

    if (!result.success) {
      setError(result.error)
      return
    }

    startRefresh(() => router.refresh())
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
        The adopter has signed and paid. Signing here completes the adoption and emails them their copy.
      </p>

      <div>
        <label htmlFor="countersign-agreed" className="flex items-start gap-3 cursor-pointer">
          <input
            id="countersign-agreed"
            type="checkbox"
            className="mt-0.5 w-4 h-4 shrink-0 accent-primary-light dark:accent-primary-dark"
            {...register('agreed')}
          />
          <span className="text-xs text-text-light dark:text-text-dark">
            I accept this agreement on behalf of Little Paws Dachshund Rescue.
          </span>
        </label>
        {errors.agreed && (
          <p role="alert" className="mt-1.5 text-[11px] font-mono text-red-500 dark:text-red-400">
            {errors.agreed.message}
          </p>
        )}
      </div>

      <FormField
        id="countersign-name"
        label="Type your full name to sign"
        autoComplete="name"
        placeholder={signerName}
        inputClassName="font-signature! text-2xl! py-2!"
        {...register('typedName')}
        error={errors.typedName?.message}
      />

      <FormError error={error} />
      <SubmitButton loading={isSubmitting || isRefreshing} isValid label="Sign and complete adoption" />
    </form>
  )
}
