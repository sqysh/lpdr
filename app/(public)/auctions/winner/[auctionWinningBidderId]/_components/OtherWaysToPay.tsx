'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'
import { formatMoney } from 'lib/utils/currency.utils'

type Method = keyof typeof OFFLINE_PAYMENT_INSTRUCTIONS

export function OtherWaysToPay({ total, name, auctionTitle }: { total: number; name: string; auctionTitle: string }) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<Method | null>(null)

  // What the treasurer sees in the payment app, so the payment can be matched to this win
  const note = [auctionTitle, name].filter(Boolean).join(', ')

  return (
    <section className="border border-border-light dark:border-border-dark">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <span className="text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark">Other ways to pay</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-light dark:text-muted-dark transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
            {(Object.keys(OFFLINE_PAYMENT_INSTRUCTIONS) as Method[]).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={method === key}
                onClick={() => setMethod(key)}
                className={`px-3 py-2.5 border text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${method === key ? 'border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5 text-text-light dark:text-text-dark' : 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'}`}
              >
                {OFFLINE_PAYMENT_INSTRUCTIONS[key].label}
              </button>
            ))}
          </div>

          {method && (
            <div className="space-y-2 text-sm text-muted-light dark:text-muted-dark leading-relaxed" aria-live="polite">
              <p>
                Please send <strong className="text-text-light dark:text-text-dark">{formatMoney(total)}</strong>.
              </p>
              <p className="p-3 border-l-2 border-primary-light dark:border-primary-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark">
                {OFFLINE_PAYMENT_INSTRUCTIONS[method].instruction}
              </p>
              <p>
                Put <strong className="text-text-light dark:text-text-dark">&ldquo;{note}&rdquo;</strong> in the payment note so we can
                match it to your items. We&apos;ll email your receipt once it arrives.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
