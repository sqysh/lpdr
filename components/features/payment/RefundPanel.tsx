'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { refundOrder } from 'lib/actions/admin/order/refundOrder'
import { refundOrderSchema, type RefundOrderInput, type RefundOrderValues } from 'lib/schemas/order.schema'
import { formatMoney } from 'lib/utils/currency.utils'
import { Loader2 } from 'lucide-react'
import { MONEY_PATTERN } from 'lib/constants/regex.constants'

type Preset = { label: string; amount: number }

export function RefundPanel({ orderId, remaining, presets = [] }: { orderId: string; remaining: number; presets?: Preset[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  // What was left to refund when this refund went out. Once the webhook records it, `remaining` moves
  // and the waiting message gives way to the updated figures
  const [sentAt, setSentAt] = useState<number | null>(null)
  const waiting = sentAt !== null && sentAt === remaining
  const [isRefreshing, startRefresh] = useTransition()

  const polls = useRef(0)

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<RefundOrderInput, unknown, RefundOrderValues>({
    resolver: zodResolver(refundOrderSchema),
    defaultValues: { orderId, amount: remaining.toFixed(2), reason: 'requested_by_customer' }
  })

  const amountInput = useWatch({ control, name: 'amount' })
  const amount = MONEY_PATTERN.test(amountInput ?? '') ? Number(amountInput) : 0

  const onSubmit = async () => {
    setError(null)
    const result = await refundOrder(getValues())

    if (!result.success) {
      setError(result.error)
      return
    }

    setSentAt(remaining)
  }

  useEffect(() => {
    if (!waiting) return
    polls.current = 0

    // The webhook usually lands within a few seconds of the refund; refreshing until it does saves a manual reload
    const interval = setInterval(() => {
      polls.current += 1
      if (polls.current > 10) return clearInterval(interval)
      startRefresh(() => router.refresh())
    }, 2000)

    return () => clearInterval(interval)
  }, [waiting, router])

  if (waiting) {
    return (
      <p className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
        {isRefreshing && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
        Refund sent. Waiting for Stripe to confirm it, usually a few seconds.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[...presets.filter((p) => p.amount > 0 && p.amount <= remaining), { label: 'Full', amount: remaining }].map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setValue('amount', p.amount.toFixed(2), { shouldValidate: true })}
              className="px-2.5 py-1 border border-border-light dark:border-border-dark text-[10px] font-mono text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors"
            >
              {p.label} {formatMoney(p.amount)}
            </button>
          ))}
        </div>
      )}

      <FormField
        id="refund-amount"
        label="Amount to refund"
        inputMode="decimal"
        {...register('amount')}
        hint={`Up to ${formatMoney(remaining)}`}
        error={errors.amount?.message}
      />

      <FormField id="refund-reason" label="Reason" type="select" {...register('reason')}>
        <option value="requested_by_customer">Requested by the adopter</option>
        <option value="duplicate">Duplicate payment</option>
        <option value="fraudulent">Fraudulent</option>
      </FormField>

      <FormError error={error} />
      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
        Goes back to the card it was paid with. The customer is emailed automatically.
      </p>
      <SubmitButton
        loading={isSubmitting || isRefreshing}
        isValid={amount > 0}
        label={amount > 0 ? `Refund ${formatMoney(amount)}` : 'Refund'}
      />
    </form>
  )
}
