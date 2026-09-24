const NEUTRAL =
  'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
const GOOD = 'bg-green-500/10 text-green-600 dark:text-green-400'
const BAD = 'bg-red-500/10 text-red-500 dark:text-red-400'
const WARN = 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
const REFUND = 'bg-sky-500/10 text-sky-600 dark:text-sky-400'

/**
 * Keyed in lowercase and looked up that way, because this takes both Stripe's lowercase
 * subscription statuses and our own uppercase enums. Anything unmatched falls through to
 * neutral rather than looking like a state that means something.
 */
const TONES: Record<string, string> = {
  // Stripe subscriptions
  active: GOOD,
  succeeded: GOOD,
  past_due: BAD,
  canceled: NEUTRAL,
  ended: NEUTRAL,

  // Order status
  confirmed: GOOD,
  partially_refunded: REFUND,
  refunded: REFUND,
  pending: WARN,
  processing: WARN,
  failed: BAD,
  cancelled: NEUTRAL
}

export function StatusPill({ status }: { status: string }) {
  const tone = TONES[status.toLowerCase()] ?? NEUTRAL

  return <span className={`text-f9 font-black tracking-widest uppercase px-2 py-0.5 ${tone}`}>{status.replaceAll('_', ' ')}</span>
}
