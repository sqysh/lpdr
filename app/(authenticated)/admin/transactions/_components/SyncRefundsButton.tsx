'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw } from 'lucide-react'
import { syncRefundsFromStripe } from 'lib/actions/admin/order/syncRefundsFromStripe'

export function SyncRefundsButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  const sync = () =>
    startTransition(async () => {
      const res = await syncRefundsFromStripe()
      setResult(
        res.success
          ? res.data.updated
            ? `Updated ${res.data.updated} order${res.data.updated === 1 ? '' : 's'}`
            : 'Everything matches Stripe'
          : res.error
      )
      startTransition(() => router.refresh())
    })

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={sync}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-3 py-2 border border-border-light dark:border-border-dark text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark disabled:opacity-60 transition-colors"
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-3 h-3" aria-hidden="true" />}
        Sync refunds from Stripe
      </button>
      {result && <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">{result}</span>}
    </div>
  )
}
