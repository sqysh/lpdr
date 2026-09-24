'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormError, FormField } from 'components/_primitives'
import { voidAdoptionAgreement, returnAdoptionAgreement } from 'lib/actions/admin/adoption-agreement/closeAdoptionAgreement'
import { closeAgreementSchema, type CloseAgreementInput, type CloseAgreementValues } from 'lib/schemas/adoption-agreement.schema'
import { Loader2 } from 'lucide-react'

const MODES = {
  void: {
    open: 'Cancel this agreement',
    title: 'Cancel agreement',
    body: "The adopter's link will stop working and the dog will be available for a new agreement. The record stays for reference.",
    placeholder: 'Adopter changed their mind, wrong dog selected…',
    confirm: 'Cancel agreement',
    action: voidAdoptionAgreement
  },
  return: {
    open: 'Mark as returned',
    title: 'Mark as returned',
    body: 'Use this when the dog has come back. The agreement stays as a record, and the dog will be available for a new agreement. Any refund is handled separately.',
    placeholder: 'Returned during the two-week trial…',
    confirm: 'Mark as returned',
    action: returnAdoptionAgreement
  }
} as const

export function ClosePanel({ agreementId, mode }: { agreementId: string; mode: keyof typeof MODES }) {
  const m = MODES[mode]
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, startRefresh] = useTransition()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<CloseAgreementInput, unknown, CloseAgreementValues>({
    resolver: zodResolver(closeAgreementSchema),
    defaultValues: { agreementId, reason: '' }
  })

  const onSubmit = async () => {
    setError(null)
    const result = await m.action(getValues())

    if (!result.success) {
      setError(result.error)
      return
    }

    startRefresh(() => router.refresh())
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[10px] font-mono tracking-eyebrow uppercase text-red-600/80 dark:text-red-400/80 hover:text-red-600 dark:hover:text-red-400 hover:underline focus:outline-none focus-visible:underline"
      >
        {m.open}
      </button>
    )
  }

  const busy = isSubmitting || isRefreshing

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3 p-4 border border-red-500/30 bg-red-500/5">
      <p className="text-[10px] font-mono tracking-eyebrow uppercase text-red-600 dark:text-red-400">{m.title}</p>
      <p className="text-xs font-mono text-muted-light dark:text-muted-dark">{m.body}</p>
      <FormField
        id="close-reason"
        label="Reason"
        type="textarea"
        rows={2}
        placeholder={m.placeholder}
        {...register('reason')}
        error={errors.reason?.message}
      />
      <FormError error={error} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-f10 font-mono tracking-eyebrow uppercase hover:bg-red-700 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600"
        >
          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
          {m.confirm}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={busy}
          className="px-4 py-2.5 border border-border-light dark:border-border-dark text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
        >
          Keep it
        </button>
      </div>
    </form>
  )
}
