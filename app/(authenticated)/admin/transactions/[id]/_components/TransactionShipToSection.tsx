'use client'

import { useState } from 'react'
import { Check, Copy, MapPin } from 'lucide-react'
import { IOrder } from 'types/order.types'

function addressLines(order: IOrder) {
  const cityLine = [order.city, [order.state, order.zipPostalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return [order.customerName, order.addressLine1, order.addressLine2, cityLine].filter(Boolean) as string[]
}

export function TransactionShipToSection({ order }: { order: IOrder }) {
  const [copied, setCopied] = useState(false)
  const lines = addressLines(order)

  // Pasted straight into a label site, so it's plain lines with no labels
  const copy = async () => {
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section
      aria-labelledby="ship-to-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-light dark:border-border-dark">
        <h2 id="ship-to-heading" className="flex items-center gap-2 text-sm font-semibold text-text-light dark:text-text-dark">
          <MapPin className="w-4 h-4 text-primary-light dark:text-primary-dark" aria-hidden="true" />
          Ship to
        </h2>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy shipping address"
          className="flex items-center gap-1.5 min-h-8 text-[10px] font-mono text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          {copied ? (
            <Check className="w-3 h-3 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <Copy className="w-3 h-3 shrink-0" aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <address className="not-italic px-4 py-3 text-xs font-mono leading-relaxed text-text-light dark:text-text-dark">
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </address>

      <p className="px-4 pb-3 text-[10px] font-mono text-muted-light dark:text-muted-dark">
        Saved from their account when they paid. If they&apos;ve moved since, check with them before shipping.
      </p>
    </section>
  )
}
