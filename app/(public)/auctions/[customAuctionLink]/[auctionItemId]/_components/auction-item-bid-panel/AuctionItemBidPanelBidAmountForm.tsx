'use client'

import { RefObject } from 'react'
import { DollarSign, Gavel, Loader2 } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import { EYEBROW } from './AuctionItemBidPanelParts'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  submitting: boolean
  disabled: boolean
  minimumBid: number
  currentBid: number
  submitLabel: string
  inputRef: RefObject<HTMLInputElement | null>
}

export function AuctionItemBidPanelBidAmountForm(props: Props) {
  const { label, value, onChange, onSubmit, submitting, disabled, minimumBid, currentBid, submitLabel, inputRef } = props

  return (
    <div className="space-y-2">
      <label htmlFor="bid-amount" className={`block ${EYEBROW}`}>
        {label}
      </label>

      <div className="flex items-stretch gap-2">
        <div className="relative flex-1 min-w-0">
          <DollarSign
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id="bid-amount"
            name="bidAmount"
            type="number"
            inputMode="decimal"
            min={minimumBid}
            step="1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit()
            }}
            placeholder={String(minimumBid)}
            aria-describedby="bid-amount-hint"
            className="w-full pl-8 pr-3 py-3 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-mono font-black tabular-nums focus:outline-none focus:border-primary-light dark:focus:border-primary-dark"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="btn-shimmer relative overflow-hidden shrink-0 flex items-center gap-2 px-5 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Gavel size={14} aria-hidden="true" />}
          <span className="text-f10 font-mono tracking-eyebrow uppercase font-black">{submitting ? 'Bidding' : submitLabel}</span>
        </button>
      </div>

      <p id="bid-amount-hint" className="text-f9 font-mono text-muted-light dark:text-muted-dark">
        Current bid {formatMoney(currentBid)}. Bids of {formatMoney(minimumBid)} or more are accepted.
      </p>
    </div>
  )
}
