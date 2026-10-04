import { useEffect, useRef, useState } from 'react'
import {
  XCircle,
  User,
  ShoppingCart,
  Gavel,
  CreditCard,
  Package,
  UserX,
  UserCheck,
  Star,
  Activity,
  FileText,
  Mail,
  MapPin,
  AlertTriangle,
  Undo2,
  Repeat,
  PenLine
} from 'lucide-react'
import { PanelHeader } from './PanelHeader'
import { AnimatePresence, motion } from 'framer-motion'
import { SUPER_USER_CHANNEL } from 'lib/pusher/pusher.constants'
import { getPusherClient, releaseChannel } from 'lib/pusher/pusher-client'
import { formatMoney } from 'lib/utils/currency.utils'

interface EventConfig {
  icon: React.ElementType
  label: string
  color: string
  format: (data: Record<string, unknown>) => string
}

interface LiveEvent {
  id: string
  event: string
  data: Record<string, unknown>
  ts: string
}

type Data = Record<string, unknown>

// Pusher payloads arrive untyped, so values are coerced before display
const money = (value: unknown) => formatMoney(Number(value ?? 0))
const str = (value: unknown) => (value == null ? '' : String(value))
const who = (d: Data) => str(d.name).trim() || str(d.customerName).trim() || str(d.email) || str(d.adopterEmail) || 'Someone'

const ORDER_TYPE_LABEL: Record<string, string> = {
  ONE_TIME_DONATION: 'a donation',
  RECURRING_DONATION: 'a recurring donation',
  ADOPTION_FEE: 'an adoption application',
  ADOPTION_AGREEMENT: 'an adoption',
  AUCTION_PURCHASE: 'auction winnings',
  PURCHASE: 'a merch order'
}
const orderType = (value: unknown) => ORDER_TYPE_LABEL[str(value)] ?? (str(value).replace(/_/g, ' ').toLowerCase() || 'an order')

const STATE_GREEN = 'text-green-500'
const STATE_RED = 'text-red-500'
const STATE_AMBER = 'text-amber-500'
const STATE_PRIMARY = 'text-primary-light dark:text-primary-dark'
const STATE_MUTED = 'text-muted-light dark:text-muted-dark'

// Events that mean someone has to step in. Pinned above the feed until dismissed, whatever the filter
const ALERT_EVENTS = ['auto-pay-needs-attention', 'payment-request-failed', 'auction-close-failed', 'auction-anomaly']

// Errors that already have their own, clearer event in the feed, so the error row would only repeat it
const COVERED_ERRORS = ['Failed to send winner email', '[AUTO-PAY] charge failed', '[CRON] end-auction']

const EVENT_CONFIG: Record<string, EventConfig> = {
  // ── People ──
  'user-registered': {
    icon: Star,
    label: 'New Account',
    color: STATE_PRIMARY,
    format: (d) => `${str(d.email)} created an account with ${str(d.method)}`
  },
  'user-signed-in': {
    icon: User,
    label: 'Signed In',
    color: STATE_GREEN,
    format: (d) => `${who(d)} signed in with ${str(d.method)}${d.name ? ` (${str(d.email)})` : ''}`
  },
  'user-signed-out': {
    icon: UserX,
    label: 'Signed Out',
    color: STATE_MUTED,
    format: (d) => `${who(d)} signed out`
  },
  'user-name-updated': {
    icon: PenLine,
    label: 'Name Added',
    color: STATE_PRIMARY,
    format: (d) => `${str(d.email)} is now ${str(d.name)}`
  },
  'address-updated': {
    icon: MapPin,
    label: 'Address',
    color: 'text-cyan-500',
    format: (d) => `${str(d.email)} ${d.isFirstAddress ? 'added' : 'updated'} an address in ${str(d.city)}, ${str(d.state)}`
  },
  'user-suspended': {
    icon: UserX,
    label: 'User Suspended',
    color: STATE_AMBER,
    format: (d) => `${str(d.targetEmail)} suspended by ${str(d.actor)}`
  },
  'user-terminated': {
    icon: UserX,
    label: 'User Terminated',
    color: STATE_RED,
    format: (d) => `${str(d.targetEmail)} terminated by ${str(d.actor)}`
  },
  'user-reinstated': {
    icon: UserCheck,
    label: 'User Reinstated',
    color: STATE_GREEN,
    format: (d) => `${str(d.targetEmail)} reinstated by ${str(d.actor)}`
  },

  // ── Orders and payments ──
  'order-created': {
    icon: ShoppingCart,
    label: 'Payment',
    color: STATE_GREEN,
    format: (d) => `${who(d)} paid ${money(d.amount)} for ${orderType(d.type)}`
  },
  'order-failed': {
    icon: XCircle,
    label: 'Payment Failed',
    color: STATE_RED,
    format: (d) => `${who(d)}'s ${money(d.amount)} payment for ${orderType(d.type)} failed: ${str(d.failureReason) || 'unknown reason'}`
  },
  'order-refunded': {
    icon: Undo2,
    label: 'Refund',
    color: STATE_AMBER,
    format: (d) => `${who(d)} was refunded ${money(d.amount ?? d.refundedAmount)}${d.type ? ` for ${orderType(d.type)}` : ''}`
  },
  'order-shipped': {
    icon: Package,
    label: 'Shipping',
    color: STATE_GREEN,
    format: (d) => `${who(d)}'s order marked ${str(d.shippingStatus).replace(/_/g, ' ').toLowerCase()}`
  },
  'recurring-donation': {
    icon: Repeat,
    label: 'Recurring Donation',
    color: STATE_GREEN,
    format: (d) =>
      `${who(d)} gave ${money(d.amount)} ${str(d.frequency).toLowerCase()} ${d.isFirstPayment ? '(first payment)' : '(renewal)'}`
  },
  'recurring-payment-failed': {
    icon: XCircle,
    label: 'Recurring Payment Failed',
    color: STATE_RED,
    format: (d) => `${who(d)}'s recurring ${money(d.amount)} payment failed`
  },
  'subscription-created': {
    icon: CreditCard,
    label: 'Subscription Started',
    color: STATE_PRIMARY,
    // Stripe sends this amount in cents
    format: (d) => `${str(d.email)} started ${money(Number(d.amount ?? 0) / 100)} ${str(d.frequency).toLowerCase()}`
  },
  'subscription-updated': {
    icon: CreditCard,
    label: 'Subscription Updated',
    color: STATE_AMBER,
    format: (d) => `${who(d)}'s subscription is now ${str(d.status).toLowerCase()}`
  },
  'subscription-cancelled': {
    icon: CreditCard,
    label: 'Subscription Cancelled',
    color: STATE_RED,
    format: (d) => `${who(d)} cancelled their recurring donation`
  },
  'payment-method-attached': {
    icon: CreditCard,
    label: 'Card Saved',
    color: STATE_GREEN,
    format: (d) => `${who(d)} saved a ${str(d.brand)} ending ${str(d.last4)}`
  },
  'payment-method-detached': {
    icon: CreditCard,
    label: 'Card Removed',
    color: STATE_AMBER,
    format: (d) => `${who(d)} removed a ${str(d.brand)} ending ${str(d.last4)}`
  },
  'payment-method-updated': {
    icon: CreditCard,
    label: 'Card Updated',
    color: STATE_AMBER,
    format: (d) => `${who(d)} updated a ${str(d.brand)} ending ${str(d.last4)}`
  },

  // ── Auctions ──
  'auction-created': {
    icon: Gavel,
    label: 'Auction Created',
    color: STATE_PRIMARY,
    format: (d) => `${str(d.title)} created by ${str(d.createdBy)}`
  },
  'auction-started': {
    icon: Gavel,
    label: 'Auction Started',
    color: STATE_GREEN,
    format: (d) => `${str(d.auctionTitle)} is now live`
  },
  'auction-ended': {
    icon: Gavel,
    label: 'Auction Ended',
    color: STATE_AMBER,
    format: (d) => `${str(d.auctionTitle)} closed with ${money(d.totalRaised)} in winning bids`
  },
  'auction-updated': {
    icon: Gavel,
    label: 'Auction Edited',
    color: STATE_MUTED,
    format: (d) => `${str(d.title) || str(d.auctionId)} edited${d.datesChanged ? ', dates changed' : ''}`
  },
  'auction-item-created': {
    icon: Gavel,
    label: 'Item Added',
    color: STATE_PRIMARY,
    format: (d) => `${str(d.name)} (${str(d.sellingFormat).toLowerCase()}) added by ${str(d.createdBy)}`
  },
  'auction-item-updated': {
    icon: Gavel,
    label: 'Item Edited',
    color: STATE_MUTED,
    format: (d) =>
      `${str(d.name)} edited${d.duringLiveAuction ? ' during the live auction' : ''}${Number(d.photosAdded) ? `, ${d.photosAdded} photo(s) added` : ''}`
  },
  'auction-item-deleted': {
    icon: Gavel,
    label: 'Item Deleted',
    color: STATE_AMBER,
    format: (d) => `${str(d.name) || str(d.auctionItemId)} was deleted`
  },
  'bid-placed': {
    icon: Gavel,
    label: 'Bid',
    color: STATE_PRIMARY,
    format: (d) => `${str(d.bidderName) || 'Someone'} bid ${money(d.bidAmount)} on ${str(d.itemName)}`
  },
  'outbid-email-sent': {
    icon: Mail,
    label: 'Outbid',
    color: STATE_AMBER,
    format: (d) => `${str(d.name)} was outbid on ${str(d.itemName)}: their ${money(d.yourBid)} beaten by ${money(d.newBid)}`
  },
  'auction-closed': {
    icon: Gavel,
    label: 'Auction Closed',
    color: STATE_GREEN,
    format: (d) =>
      `${str(d.auctionTitle)}: ${money(d.totalRaised)} from ${str(d.winners)} winners${Number(d.failedPaymentSteps) ? `, ${d.failedPaymentSteps} payment steps failed` : ''}, in ${Math.round(Number(d.durationMs) / 1000)}s`
  },
  'auction-close-failed': {
    icon: AlertTriangle,
    label: 'Auction Close Failed',
    color: STATE_RED,
    format: (d) => `${str(d.auctionTitle)} could not close: ${str(d.error)}`
  },
  'auction-anomaly': {
    icon: AlertTriangle,
    label: 'Auction Problem',
    color: STATE_RED,
    format: (d) => `${str(d.auctionTitle)}: ${str(d.message)}${d.itemName ? ` (${str(d.itemName)})` : ''}`
  },
  'auto-pay-charged': {
    icon: CreditCard,
    label: 'Auto-Pay Charged',
    color: STATE_GREEN,
    format: (d) =>
      `${str(d.name)} was charged ${money(d.amount)} automatically${d.coverFees ? ', covering fees' : ''}${d.via === 'webhook' ? ' (recorded by webhook)' : ''}`
  },
  'auto-pay-payment-link': {
    icon: Mail,
    label: 'Payment Link Sent',
    color: 'text-sky-500',
    format: (d) => `${str(d.name)} owes ${money(d.total)} and was sent a payment link: ${str(d.reason)}`
  },
  'auto-pay-needs-attention': {
    icon: AlertTriangle,
    label: 'Charged, Not Recorded',
    color: STATE_RED,
    format: (d) => `${str(d.name)} was charged ${money(d.amount)} but the win wasn't recorded. ${str(d.paymentIntentId)}: ${str(d.error)}`
  },
  'payment-request-failed': {
    icon: AlertTriangle,
    label: 'Winner Email Failed',
    color: STATE_RED,
    format: (d) => `${str(d.name)} (${str(d.email)}) owes ${money(d.total)} but their winner email failed: ${str(d.error)}`
  },
  'winner-marked-paid': {
    icon: CreditCard,
    label: 'Winner Marked Paid',
    color: STATE_GREEN,
    format: (d) => `${str(d.name)} paid ${money(d.amount)} by ${str(d.method).toLowerCase()} for ${str(d.auctionTitle)}`
  },

  // ── Adoptions ──
  'adoption-agreement-drafted': {
    icon: FileText,
    label: 'Agreement Drafted',
    color: STATE_MUTED,
    format: (d) => `Agreement for ${str(d.dogName)} drafted for ${str(d.adopterEmail)}, fee ${money(d.adoptionFee)}`
  },
  'adoption-agreement-sent': {
    icon: FileText,
    label: 'Agreement Sent',
    color: STATE_PRIMARY,
    format: (d) => `${str(d.dogName)}'s agreement ${d.resent ? 'sent again' : 'sent'} to ${str(d.adopterEmail)}`
  },
  'adoption-agreement-updated': {
    icon: FileText,
    label: 'Agreement Edited',
    color: STATE_MUTED,
    format: (d) => `${str(d.dogName) || 'An agreement'} was edited`
  },
  'adoption-agreement-terms-signed': {
    icon: PenLine,
    label: 'Terms Signed',
    color: STATE_PRIMARY,
    format: (d) => `${who(d)} signed the terms for ${str(d.dogName)}`
  },
  'adoption-agreement-signed': {
    icon: PenLine,
    label: 'Agreement Signed',
    color: STATE_GREEN,
    format: (d) =>
      `${who(d)} signed for ${str(d.dogName)}, paying by ${str(d.paymentMethod).toLowerCase()}${Number(d.additionalDonation) ? ` with a ${money(d.additionalDonation)} donation` : ''}`
  },
  'adoption-agreement-paid': {
    icon: CreditCard,
    label: 'Adoption Paid',
    color: STATE_GREEN,
    format: (d) => `${str(d.dogName)}'s adoption paid, ${money(d.amount)} by ${str(d.method).toLowerCase()}`
  },
  'adoption-agreement-completed': {
    icon: FileText,
    label: 'Adoption Complete',
    color: STATE_GREEN,
    format: (d) => `${str(d.dogName)}'s adoption is complete`
  },
  'adoption-fee-created': {
    icon: FileText,
    label: 'Application Fee',
    color: STATE_PRIMARY,
    format: (d) => `${who(d)} paid the application fee${d.state ? ` (${str(d.state)})` : ''}`
  },

  // ── System ──
  'system-error': {
    icon: AlertTriangle,
    label: 'Error',
    color: STATE_AMBER,
    format: (d) => {
      const meta = (d.metadata ?? {}) as Data
      const detail = [meta.email, meta.error ?? meta.detail].filter(Boolean).map(str).join(' · ')
      return `${str(d.message)}${detail ? `: ${detail}` : ''}`
    }
  },
  'test-ping': {
    icon: Activity,
    label: 'Test Ping',
    color: STATE_GREEN,
    format: (d) => `${str(d.message)}`
  }
}

// Agreement close events (void, returned) are named at runtime, so anything adoption-shaped without its own entry still reads well
const ADOPTION_FALLBACK: EventConfig = {
  icon: FileText,
  label: 'Adoption',
  color: STATE_MUTED,
  format: (d) => [str(d.dogName), str(d.adopterEmail), str(d.reason)].filter(Boolean).join(' · ')
}

const DEFAULT_CONFIG: EventConfig = {
  icon: Activity,
  label: 'Event',
  color: STATE_MUTED,
  format: (d) => JSON.stringify(d).slice(0, 120)
}

const configFor = (event: string) =>
  EVENT_CONFIG[event] ??
  (event.startsWith('adoption-agreement-')
    ? { ...ADOPTION_FALLBACK, label: event.replace('adoption-agreement-', 'Agreement ') }
    : DEFAULT_CONFIG)

const FILTERS = ['all', 'auctions', 'payments', 'adoptions', 'users', 'errors']

const FILTER_MATCH: Record<string, (event: string) => boolean> = {
  auctions: (e) =>
    e.startsWith('auction') ||
    e.startsWith('auto-pay') ||
    ['bid-placed', 'outbid-email-sent', 'payment-request-failed', 'winner-marked-paid'].includes(e),
  payments: (e) => e.startsWith('order-') || e.startsWith('subscription-') || e.startsWith('payment-method-') || e.startsWith('recurring-'),
  adoptions: (e) => e.startsWith('adoption-'),
  users: (e) => e.startsWith('user-') || e === 'address-updated',
  errors: (e) => e === 'system-error' || ALERT_EVENTS.includes(e) || e.endsWith('-failed')
}

export function LiveActionsFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [alerts, setAlerts] = useState<LiveEvent[]>([])
  const [filter, setFilter] = useState<string>('all')
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(SUPER_USER_CHANNEL)

    const onEvent = (event: string, data: Data) => {
      if (event.startsWith('pusher:')) return

      // An error that already has its own event in the feed would only repeat it
      if (event === 'system-error' && COVERED_ERRORS.includes(str(data.message))) return

      // auto-pay arrives as one event with an outcome; each outcome gets its own row style
      const key = event === 'auto-pay' && typeof data.outcome === 'string' ? `auto-pay-${data.outcome}` : event

      const newEvent: LiveEvent = {
        id: `${key}-${Date.now()}-${Math.random()}`,
        event: key,
        data,
        ts: (data._ts as string) ?? new Date().toISOString()
      }

      setEvents((prev) => [newEvent, ...prev].slice(0, 200))
      // Kept outside the 200 cap so a burst of bids can't push an alert out of view
      if (ALERT_EVENTS.includes(key)) setAlerts((prev) => [newEvent, ...prev])
      feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }

    channel.bind_global(onEvent)

    return () => {
      channel.unbind_global(onEvent)
      releaseChannel(SUPER_USER_CHANNEL)
    }
  }, [])

  const filtered = filter === 'all' ? events : events.filter((e) => FILTER_MATCH[filter]?.(e.event))

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <PanelHeader
        label={`Live Actions (${events.length})`}
        action={
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 bg-green-500" />
            </span>
          </div>
        }
      />

      {alerts.length > 0 && (
        <ul role="list" aria-label="Needs attention" className="shrink-0 border-b border-red-500/40 bg-red-500/5 max-h-48 overflow-y-auto">
          {alerts.map((alert) => {
            const config = configFor(alert.event)
            const time = new Date(alert.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

            return (
              <li key={alert.id} role="alert" className="flex items-start gap-3 px-4 py-2.5 border-b border-red-500/20 last:border-b-0">
                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[9px] tracking-[0.12em] uppercase font-bold text-red-500">
                    {config.label} · {time}
                  </p>
                  {/* Wrapped, not truncated: the payment id and error here are what gets copied */}
                  <p className="font-mono text-[10px] text-text-light dark:text-text-dark leading-snug wrap-break-word">
                    {config.format(alert.data)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
                  className="shrink-0 font-mono text-[9px] tracking-widest uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  Dismiss
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex items-center gap-0 border-b border-border-light dark:border-border-dark shrink-0 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 font-mono text-[9px] tracking-widest uppercase border-r border-border-light dark:border-border-dark transition-colors focus:outline-none ${
              filter === f
                ? 'bg-primary-light dark:bg-primary-dark text-white'
                : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto px-3 font-mono text-[9px] text-muted-light dark:text-muted-dark whitespace-nowrap">
          {filtered.length} events
        </span>
      </div>

      <div ref={feedRef} className="flex-1 overflow-y-auto" aria-label="Live platform activity feed" aria-live="polite" aria-atomic="false">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
            <Activity size={20} className="text-muted-light dark:text-muted-dark opacity-30" aria-hidden="true" />
            <p className="font-mono text-[9px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">Waiting for activity...</p>
          </div>
        ) : (
          <ul role="list">
            <AnimatePresence mode="popLayout">
              {filtered.map((evt) => {
                const config = configFor(evt.event)
                const Icon = config.icon
                const time = new Date(evt.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

                return (
                  <motion.li
                    key={evt.id}
                    initial={{ opacity: 0, x: -16, backgroundColor: 'rgba(8,145,178,0.12)' }}
                    animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(8,145,178,0)' }}
                    transition={{ duration: 0.35 }}
                    className="flex items-start gap-3 px-4 py-2.5 border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                  >
                    <div className={`mt-0.5 shrink-0 ${config.color}`} aria-hidden="true">
                      <Icon size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`font-mono text-[9px] tracking-[0.12em] uppercase font-bold ${config.color}`}>{config.label}</span>
                      {/* Full sentence on hover when the row is truncated */}
                      <p
                        title={config.format(evt.data)}
                        className="mt-0.5 font-mono text-[10px] text-text-light dark:text-text-dark leading-snug truncate"
                      >
                        {config.format(evt.data)}
                      </p>
                    </div>
                    <span className="font-mono text-[9px] text-muted-light dark:text-muted-dark tabular-nums shrink-0 mt-0.5">{time}</span>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  )
}
