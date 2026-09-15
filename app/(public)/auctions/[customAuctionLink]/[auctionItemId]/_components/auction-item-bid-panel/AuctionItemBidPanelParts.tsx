'use client'

import { AlertCircle, Check, CheckCircle, Loader2, RefreshCw, TrendingUp, Trophy, Zap } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import { QUICK_BID_INCREMENT } from 'lib/constants/auction.constants'

const EYEBROW = 'text-f9 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark'
const PANEL = 'flex items-start gap-2.5 px-4 py-3 border'

export function CurrentPrice({
  label,
  amount,
  bidCount,
  topBidderName
}: {
  label: string
  amount: number
  bidCount?: number
  topBidderName?: string
}) {
  return (
    <div>
      <p className={`${EYEBROW} mb-1.5`}>{label}</p>
      <p className="font-mono font-black text-3xl xs:text-4xl text-text-light dark:text-text-dark leading-none" aria-live="polite">
        {formatMoney(amount)}
      </p>
      {!!bidCount && (
        <p className="text-f10 font-mono text-muted-light dark:text-muted-dark mt-1.5">
          {bidCount} bid{bidCount !== 1 ? 's' : ''}
          {topBidderName && (
            <>
              {' '}
              · Top bidder: <span className="text-text-light dark:text-text-dark">{topBidderName}</span>
            </>
          )}
        </p>
      )}
    </div>
  )
}

export function StandingBanner({
  isTopBidder,
  myBidAmount,
  justRaised
}: {
  isTopBidder: boolean
  myBidAmount: number
  justRaised: boolean
}) {
  const title = !isTopBidder ? 'You have been outbid' : justRaised ? 'You increased your bid' : 'You are the top bidder'

  const detail = !isTopBidder
    ? 'Bid again below to get back in front.'
    : justRaised
      ? 'You are still the top bidder.'
      : 'You do not need to do anything.'

  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 px-4 py-3 border ${
        isTopBidder
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isTopBidder ? (
          <Trophy size={16} className="shrink-0" aria-hidden="true" />
        ) : (
          <TrendingUp size={16} className="shrink-0" aria-hidden="true" />
        )}
        <div className="min-w-0">
          <p className="text-f10 font-mono tracking-eyebrow uppercase font-black">{title}</p>
          <p className="text-f9 font-mono opacity-80">{detail}</p>
        </div>
      </div>
      <span className="shrink-0 font-mono font-black text-lg tabular-nums">{formatMoney(myBidAmount)}</span>
    </div>
  )
}
export function BidPlaced({ amount }: { amount: number }) {
  return (
    <div className={`${PANEL} border-emerald-500/40 bg-emerald-500/10`}>
      <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-f10 font-mono tracking-eyebrow uppercase font-black text-emerald-700 dark:text-emerald-400">
          {formatMoney(amount)} bid placed
        </p>
        <p className="text-f9 font-mono text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">
          We will email you if someone outbids you.
        </p>
      </div>
    </div>
  )
}

export function QuickBidButton({
  amount,
  confirming,
  submitting,
  onPress,
  onCancel
}: {
  amount: number
  confirming: boolean
  submitting: boolean
  onPress: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={onPress}
        disabled={submitting}
        aria-describedby={confirming ? 'bid-panel-terms' : undefined}
        aria-label={confirming ? `Confirm instant bid of ${formatMoney(amount)}` : `Instant bid ${formatMoney(amount)}`}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors duration-200 focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          confirming
            ? 'border border-amber-500/60 bg-amber-500/15 text-amber-700 dark:text-amber-300 focus-visible:ring-amber-500'
            : 'border border-cyan-600/20 hover:border-cyan-600/50 bg-cyan-600/10 hover:bg-cyan-600/15 text-cyan-700 dark:border-violet-400/20 dark:hover:border-violet-400/50 dark:bg-violet-400/10 dark:hover:bg-violet-400/15 dark:text-violet-400 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400'
        }`}
      >
        <span className="flex items-center gap-2">
          {submitting ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : confirming ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Zap size={14} aria-hidden="true" />
          )}
          <span className="text-left">
            <span className="block text-f10 font-mono tracking-eyebrow uppercase font-black leading-none mb-0.5">
              {submitting ? 'Placing bid' : confirming ? 'Tap again to bid' : 'Instant Bid'}
            </span>
            <span className="block text-f9 font-mono opacity-70">
              {confirming ? 'This bid is binding' : `${formatMoney(QUICK_BID_INCREMENT)} above the current bid`}
            </span>
          </span>
        </span>
        <span className="font-mono font-black text-lg tabular-nums">{formatMoney(amount)}</span>
      </button>

      {confirming && !submitting && (
        <div id="bid-panel-terms" className="flex items-start justify-between gap-3 px-4 py-2.5 border border-amber-500/40 bg-amber-500/10">
          <p className="text-f9 font-mono leading-relaxed text-amber-700 dark:text-amber-300">
            If you win, payment is due and all sales are final. There are no refunds or cancellations.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="shrink-0 text-f9 font-mono underline underline-offset-4 text-amber-700/80 dark:text-amber-300/80 hover:text-amber-700 dark:hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

/** Someone got there first. The amount is offered rather than applied: it is their money and
 *  the new minimum may be past what they wanted to spend. */
export function RaceConditionNotice({ newMinimumBid, onUse }: { newMinimumBid: number; onUse: () => void }) {
  return (
    <div className={`${PANEL} border-amber-500/40 bg-amber-500/10`}>
      <RefreshCw size={14} className="text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-f10 font-mono font-black text-amber-700 dark:text-amber-300">Someone bid first</p>
        <p className="text-f9 font-mono text-amber-700/80 dark:text-amber-300/80 leading-relaxed mb-2">
          The minimum is now {formatMoney(newMinimumBid)}.
        </p>
        <button
          type="button"
          onClick={onUse}
          className="text-f9 font-mono tracking-tag uppercase underline underline-offset-4 text-amber-700 dark:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          Use {formatMoney(newMinimumBid)}
        </button>
      </div>
    </div>
  )
}

export function BidError({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-2 text-f9 font-mono text-red-500 dark:text-red-400">
      <AlertCircle size={13} className="shrink-0 mt-px" aria-hidden="true" />
      {message}
    </p>
  )
}

export { EYEBROW }
