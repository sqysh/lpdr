'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { markAgreementPaid } from 'lib/actions/admin/adoption-agreement/markAgreementPaid'
import { markAgreementPaidSchema, type MarkAgreementPaidInput, type MarkAgreementPaidValues } from 'lib/schemas/adoption-agreement.schema'
import { formatMoney } from 'lib/utils/currency.utils'

const today = () => new Date().toISOString().slice(0, 10)

export function MarkPaidPanel({ agreementId, methodLabel, total }: { agreementId: string; methodLabel: string; total: number }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<MarkAgreementPaidInput, unknown, MarkAgreementPaidValues>({
    resolver: zodResolver(markAgreementPaidSchema),
    defaultValues: { agreementId, receivedOn: today(), reference: '' }
  })

  const onSubmit = async () => {
    setError(null)
    const result = await markAgreementPaid(getValues())

    if (!result.success) {
      setError(result.error)
      return
    }

    startRefresh(() => router.refresh())
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
        The adopter has signed and is paying by {methodLabel}. Record it once{' '}
        <strong className="text-text-light dark:text-text-dark">{formatMoney(total)}</strong> has arrived.
      </p>

      <FormField id="receivedOn" label="Received on" type="date" {...register('receivedOn')} error={errors.receivedOn?.message} />
      <FormField
        id="reference"
        label="Reference"
        {...register('reference')}
        placeholder={`${methodLabel} confirmation number`}
        hint="Optional. Helps match it to the bank statement later"
        error={errors.reference?.message}
      />

      <FormError error={error} />
      <SubmitButton loading={isSubmitting || isRefreshing} isValid label={`Record ${formatMoney(total)} received`} />
    </form>
  )
}
