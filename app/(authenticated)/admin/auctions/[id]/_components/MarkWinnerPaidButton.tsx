'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markAuctionWinnerPaid } from 'lib/actions/admin/auction/markAuctionWinnerPaid'
import { formatMoney } from 'lib/utils/currency.utils'

const METHODS = [
  { value: 'ZELLE', label: 'Zelle' },
  { value: 'VENMO', label: 'Venmo' },
  { value: 'PAYPAL', label: 'PayPal' }
] as const

const fieldClass =
  'w-full px-2 py-1.5 text-[11px] font-mono border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

export function MarkWinnerPaidButton({ winningBidderId, name, total }: { winningBidderId: string; name: string; total: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<(typeof METHODS)[number]['value']>('ZELLE')
  const [receivedOn, setReceivedOn] = useState('')
  const [reference, setReference] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const confirm = () =>
    startTransition(async () => {
      setError(null)
      const result = await markAuctionWinnerPaid({ winningBidderId, method, receivedOn, reference })
      if (!result.success) {
        setError(result.error)
        return
      }
      setOpen(false)
      router.refresh()
    })

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block mt-1.5 min-h-8 text-[10px] font-mono text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        Mark paid
      </button>
    )
  }

  return (
    <div className="mt-2 w-56 space-y-2 p-3 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <p className="text-[10px] font-mono text-text-light dark:text-text-dark">
        {name} paid {formatMoney(total)}
      </p>
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value as typeof method)}
        aria-label="Payment method"
        className={fieldClass}
      >
        {METHODS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={receivedOn}
        onChange={(e) => setReceivedOn(e.target.value)}
        aria-label="Date received (defaults to today)"
        className={fieldClass}
      />
      <input
        type="text"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
        placeholder="Reference (optional)"
        aria-label="Reference"
        className={fieldClass}
      />
      {error && (
        <p role="alert" className="text-[10px] font-mono text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className="px-3 py-1.5 bg-primary-light dark:bg-primary-dark text-white text-[10px] font-mono tracking-widest uppercase disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          {pending ? 'Saving…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
