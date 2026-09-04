import Pusher from 'pusher-js'
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
  Mail
} from 'lucide-react'
import { PanelHeader } from './PanelHeader'
import { AnimatePresence, motion } from 'framer-motion'
import { SUPER_USER_CHANNEL } from 'lib/pusher/pusher.constants'

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

const EVENT_CONFIG: Record<string, EventConfig> = {
  'user-signed-in': {
    icon: User,
    label: 'Signed In',
    color: 'text-green-500',
    format: (d) => `${d.email}`
  },
  'user-registered': {
    icon: Star,
    label: 'Registered',
    color: 'text-primary-light dark:text-primary-dark',
    format: (d) => `${d.email} via ${d.method}`
  },
  'order-created': {
    icon: ShoppingCart,
    label: 'Order Created',
    color: 'text-green-500',
    format: (d) => `${d.email} — $${d.amount}`
  },
  'order-failed': {
    icon: XCircle,
    label: 'Payment Failed',
    color: 'text-red-500',
    format: (d) => `${d.email} — $${d.amount} — ${d.failureReason ?? 'unknown'}`
  },
  'recurring-donation': {
    icon: Activity,
    label: 'Recurring Donation',
    color: 'text-green-500',
    format: (d) => `${d.email} — $${d.amount} ${d.frequency}${d.isFirstPayment ? ' (first)' : ' (renewal)'}`
  },
  'subscription-created': {
    icon: CreditCard,
    label: 'Subscription Created',
    color: 'text-primary-light dark:text-primary-dark',
    format: (d) => `${d.email} — ${d.frequency}`
  },
  'subscription-updated': {
    icon: CreditCard,
    label: 'Subscription Updated',
    color: 'text-amber-500',
    format: (d) => `${d.email} — ${d.status}`
  },
  'subscription-cancelled': {
    icon: CreditCard,
    label: 'Subscription Cancelled',
    color: 'text-red-500',
    format: (d) => `${d.email}`
  },
  'payment-method-attached': {
    icon: CreditCard,
    label: 'Card Added',
    color: 'text-green-500',
    format: (d) => `${d.email} — ${d.brand} ••${d.last4}`
  },
  'payment-method-detached': {
    icon: CreditCard,
    label: 'Card Removed',
    color: 'text-amber-500',
    format: (d) => `${d.email} — ${d.brand} ••${d.last4}`
  },
  'payment-method-updated': {
    icon: CreditCard,
    label: 'Card Updated',
    color: 'text-amber-500',
    format: (d) => `${d.email} — ${d.brand} ••${d.last4}`
  },
  'auction-created': {
    icon: Gavel,
    label: 'Auction Created',
    color: 'text-primary-light dark:text-primary-dark',
    format: (d) => `${d.title} by ${d.createdBy}`
  },
  'auction-started': {
    icon: Gavel,
    label: 'Auction Started',
    color: 'text-green-500',
    format: (d) => `${d.auctionTitle}`
  },
  'auction-ended': {
    icon: Gavel,
    label: 'Auction Ended',
    color: 'text-amber-500',
    format: (d) => `${d.auctionTitle} — $${d.totalRaised} raised`
  },
  'auction-updated': {
    icon: Gavel,
    label: 'Auction Ping',
    color: 'text-muted-light dark:text-muted-dark',
    format: (d) => `${d.auctionId}`
  },
  'order-shipped': {
    icon: Package,
    label: 'Order Shipped',
    color: 'text-green-500',
    format: (d) => `${d.email ?? d.userId}`
  },
  'user-signed-out': {
    icon: UserX,
    label: 'Signed Out',
    color: 'text-muted-light dark:text-muted-dark',
    format: (d) => `${d.email}`
  },
  'user-suspended': {
    icon: UserX,
    label: 'User Suspended',
    color: 'text-amber-500',
    format: (d) => `${d.targetEmail} by ${d.actor}`
  },
  'user-terminated': {
    icon: UserX,
    label: 'User Terminated',
    color: 'text-red-500',
    format: (d) => `${d.targetEmail} by ${d.actor}`
  },
  'user-reinstated': {
    icon: UserCheck,
    label: 'User Reinstated',
    color: 'text-green-500',
    format: (d) => `${d.targetEmail} by ${d.actor}`
  },
  'adoption-fee-created': {
    icon: FileText,
    label: 'Adoption Fee',
    color: 'text-primary-light dark:text-primary-dark',
    format: (d) => `${d.email} — ${d.name} — ${d.state}`
  },
  'auction-item-created': {
    icon: Gavel,
    label: 'Item Added',
    color: 'text-primary-light dark:text-primary-dark',
    format: (d) => `${d.name} (${d.sellingFormat}) by ${d.createdBy}`
  },
  'bid-placed': {
    icon: Gavel,
    label: 'Bid Placed',
    color: 'text-primary-light dark:text-primary-dark',
    format: (d) => `$${d.bidAmount ?? d.currentBid} by ${d.bidderName ?? d.topBidder}`
  },
  'outbid-email-sent': {
    icon: Mail,
    label: 'Outbid Email',
    color: 'text-amber-500',
    format: (d) => `${d.name} outbid on ${d.itemName} — their $${d.yourBid} → new bid $${d.newBid}`
  },
  'test-ping': {
    icon: Activity,
    label: 'Test Ping',
    color: 'text-green-500',
    format: (d) => `${d.message} — ${d._ts}`
  }
}

const DEFAULT_CONFIG: EventConfig = {
  icon: Activity,
  label: 'Event',
  color: 'text-muted-light dark:text-muted-dark',
  format: (d) => JSON.stringify(d).slice(0, 80)
}

export function LiveActionsFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([])
  const [filter, setFilter] = useState<string>('all')
  const feedRef = useRef<HTMLDivElement>(null)

  const FILTERS = ['all', 'orders', 'users', 'auctions', 'payments', 'system']
  const FILTER_MATCH: Record<string, string[]> = {
    orders: ['order-created', 'order-failed', 'order-shipped', 'recurring-donation'],
    users: ['user-signed-in', 'user-registered', 'user-signed-out', 'user-suspended', 'user-terminated', 'user-reinstated'],
    auctions: ['auction-created', 'auction-started', 'auction-ended', 'auction-updated', 'bid-placed'],
    payments: [
      'subscription-created',
      'subscription-updated',
      'subscription-cancelled',
      'payment-method-attached',
      'payment-method-detached',
      'payment-method-updated'
    ],
    system: ['user-suspended', 'user-terminated', 'user-reinstated']
  }

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
    })

    const channel = pusher.subscribe(SUPER_USER_CHANNEL)

    channel.bind_global((event: string, data: Record<string, unknown>) => {
      if (event.startsWith('pusher:')) return

      const newEvent: LiveEvent = {
        id: `${event}-${Date.now()}-${Math.random()}`,
        event,
        data,
        ts: (data._ts as string) ?? new Date().toISOString()
      }

      setEvents((prev) => [newEvent, ...prev].slice(0, 200))
      feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    })

    return () => {
      channel.unbind_all()
      pusher.disconnect()
    }
  }, [])

  const filtered = filter === 'all' ? events : events.filter((e) => FILTER_MATCH[filter]?.includes(e.event))

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <PanelHeader
        label={`Live Actions (${events.length})`}
        action={
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 bg-green-500" />
            </span>
          </div>
        }
      />

      {/* Filter chips */}
      <div className="flex items-center gap-0 border-b border-border-light dark:border-border-dark shrink-0">
        {FILTERS.map((f) => (
          <button
            key={f}
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
        <span className="ml-auto px-3 font-mono text-[9px] text-muted-light dark:text-muted-dark">{filtered.length} events</span>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto"
        aria-label="Live platform activity feed"
        aria-live="polite"
        aria-atomic="false"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-12">
            <Activity size={20} className="text-muted-light dark:text-muted-dark opacity-30" aria-hidden="true" />
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Waiting for activity...
            </p>
          </div>
        ) : (
          <ul role="list">
            <AnimatePresence mode="popLayout">
              {filtered.map((evt) => {
                const config = EVENT_CONFIG[evt.event] ?? DEFAULT_CONFIG
                const Icon = config.icon
                const time = new Date(evt.ts).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
                const originChannel = evt.data._channel as string | undefined

                return (
                  <motion.li
                    key={evt.id}
                    initial={{ opacity: 0, x: -16, backgroundColor: 'rgba(8,145,178,0.12)' }}
                    animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(8,145,178,0)' }}
                    transition={{ duration: 0.35 }}
                    className="flex items-start gap-3 px-4 py-2.5 border-b border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 shrink-0 ${config.color}`} aria-hidden="true">
                      <Icon size={12} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`font-mono text-[9px] tracking-[0.12em] uppercase font-bold ${config.color}`}>
                          {config.label}
                        </span>
                        {originChannel && (
                          <span className="font-mono text-[8px] text-muted-light dark:text-muted-dark opacity-60">
                            via {originChannel}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-text-light dark:text-text-dark leading-snug truncate">
                        {config.format(evt.data)}
                      </p>
                    </div>

                    {/* Time */}
                    <span className="font-mono text-[9px] text-muted-light dark:text-muted-dark tabular-nums shrink-0 mt-0.5">
                      {time}
                    </span>
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
