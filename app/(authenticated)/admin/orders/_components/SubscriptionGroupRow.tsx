'use client'

import { fmtCurrency } from 'app/utils/_currency.utils'
import { ChevronRight, RefreshCw } from 'lucide-react'
import { OrderRow } from 'types/_order.types'
import { useRouter } from 'next/navigation'
import { StatusPill } from 'app/components/_primitives'

type GroupRow = { kind: 'group'; subscriptionId: string; orders: OrderRow[] }

function rowClass(o: OrderRow) {
  if (o.status === 'FAILED')
    return 'group border-l-2 border-l-red-500 bg-red-500/5 hover:bg-red-500/8 transition-colors'
  if (o.status === 'CONFIRMED' && o.shippingStatus === 'PENDING_FULFILLMENT')
    return 'group border-l-2 border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/8 transition-colors'
  return 'group hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors'
}

export function SubscriptionGroupRow({ group }: { group: GroupRow }) {
  const router = useRouter()
  const sorted = [...group.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const latest = sorted[0]
  const first = sorted[sorted.length - 1]
  const lifetimeValue = group.orders.reduce((s, o) => s + o.totalAmount, 0)
  const renewalCount = group.orders.length - 1

  return (
    <tr
      className={`${rowClass(latest)} cursor-pointer`}
      onClick={() => router.push(`/admin/orders/${latest.id}`)}
    >
      {/* Order — links to latest */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-xs font-mono text-primary-light dark:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark">
          #{latest.id.slice(-8)}
        </div>
      </td>

      {/* Date — first payment */}
      <td className="px-4 py-3 text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
        {new Date(first.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'America/New_York'
        })}
      </td>

      {/* Customer */}
      <td className="px-4 py-3 min-w-0 max-w-50">
        <p className="text-xs font-nunito text-text-light dark:text-text-dark truncate">
          {latest.customerName || '—'}
        </p>
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">
          {latest.customerEmail}
        </p>
      </td>

      {/* Type */}
      <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3 shrink-0" aria-hidden="true" />
          <span>
            {latest.recurringFrequency ?? 'Recurring'}
            {latest.tierName && ` · ${latest.tierName}`}
          </span>
        </div>
        <p className="text-[9px] mt-0.5 text-muted-light/70 dark:text-muted-dark/70">
          {renewalCount} renewal{renewalCount !== 1 ? 's' : ''}
        </p>
      </td>

      {/* Items */}
      <td className="px-4 py-3 text-xs font-mono text-muted-light dark:text-muted-dark">—</td>

      {/* Lifetime value */}
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark">
          {fmtCurrency(lifetimeValue)}
        </p>
        <p className="text-[9px] font-mono text-muted-light/70 dark:text-muted-dark/70 mt-0.5">
          lifetime
        </p>
      </td>

      {/* Status — latest */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusPill status={latest.status} />
      </td>

      {/* Shipping */}
      <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark">—</td>

      {/* Chevron */}
      <td className="px-4 py-3 text-right">
        <ChevronRight
          className="w-3.5 h-3.5 inline text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
          aria-hidden="true"
        />
      </td>
    </tr>
  )
}
