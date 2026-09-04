import Link from 'next/link'
import { RefreshCw, ChevronRight } from 'lucide-react'
import { SerializedSubscriptionOrder } from 'types/order.types'
import { STATUS_STYLES } from 'lib/constants/order.constants'
import { formatMoney } from 'lib/utils/currency.utils'

export function OrderSubscriptionHistory({
  orders,
  currentOrderId
}: {
  orders: SerializedSubscriptionOrder[]
  currentOrderId: string
}) {
  const lifetimeValue = orders.reduce((s, o) => s + o.totalAmount, 0)
  const renewalCount = orders.length - 1

  return (
    <section
      aria-labelledby="subscription-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark">
        <h2
          id="subscription-heading"
          className="flex items-center gap-2 font-quicksand font-black text-sm text-text-light dark:text-text-dark"
        >
          <RefreshCw
            className="w-4 h-4 text-primary-light dark:text-primary-dark"
            aria-hidden="true"
          />
          Subscription History
        </h2>
        <div className="text-right">
          <p className="text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark">
            {formatMoney(lifetimeValue)}
          </p>
          <p className="text-[9px] font-mono text-muted-light/70 dark:text-muted-dark/70">
            {renewalCount} renewal{renewalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-border-light dark:divide-border-dark">
        {orders.map((o, i) => {
          const isCurrent = o.id === currentOrderId
          return (
            <li
              key={o.id}
              className={`flex items-center gap-3 px-4 py-3 ${
                isCurrent
                  ? 'bg-primary-light/5 dark:bg-primary-dark/5'
                  : 'hover:bg-primary-light/3 dark:hover:bg-primary-dark/3'
              }`}
            >
              {/* Index */}
              <span className="text-[9px] font-mono text-muted-light/50 dark:text-muted-dark/50 w-4 text-right shrink-0">
                {orders.length - i}
              </span>

              {/* Date + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[10px] font-mono text-text-light dark:text-text-dark whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'America/New_York'
                    })}
                  </p>
                  {i === 0 && (
                    <span className="text-[8px] font-mono tracking-[0.15em] uppercase px-1.5 py-0.5 border border-primary-light/30 dark:border-primary-dark/30 text-primary-light dark:text-primary-dark">
                      Latest
                    </span>
                  )}
                  {o.isFirstPayment && (
                    <span className="text-[8px] font-mono tracking-[0.15em] uppercase px-1.5 py-0.5 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark">
                      First
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[8px] font-mono tracking-[0.15em] uppercase px-1.5 py-0.5 border border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark">
                      Viewing
                    </span>
                  )}
                </div>
                {o.paymentIntentId && (
                  <p className="text-[9px] font-mono text-muted-light/60 dark:text-muted-dark/60 mt-0.5 truncate">
                    {o.paymentIntentId}
                  </p>
                )}
              </div>

              {/* Amount */}
              <p className="text-[10px] font-mono tabular-nums font-bold text-text-light dark:text-text-dark whitespace-nowrap">
                {formatMoney(o.totalAmount)}
              </p>

              {/* Status */}
              <span
                className={`shrink-0 inline-flex px-2 py-0.5 border text-[8px] font-mono tracking-[0.15em] uppercase ${
                  STATUS_STYLES[o.status] ??
                  'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                }`}
              >
                {o.status}
              </span>

              <Link
                href={`/order-confirmation/${o.id}?ref=admin`}
                aria-label={`View order ${o.id.slice(-8)}`}
                className="shrink-0"
              >
                <ChevronRight
                  className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                  aria-hidden="true"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
