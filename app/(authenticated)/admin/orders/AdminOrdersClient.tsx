'use client'

import { useMemo, useState } from 'react'
import { Package, DollarSign, Truck, XCircle, ChevronRight } from 'lucide-react'
import { DisplayRow, FlatRow, GroupRow, OrderRow } from 'types/_order.types'
import { FILTER_LABELS, FILTERS, type Filter } from 'lib/constants/order.constants'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import { fmtCurrency } from 'app/utils/_currency.utils'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { StatusPill } from 'components/_primitives'
import Link from 'next/link'
import { rowClass } from 'app/utils/_order.utils'
import { useRouter } from 'next/navigation'
import { SubscriptionGroupRow } from './_components/SubscriptionGroupRow'

const COL_COUNT = 9

export function AdminOrdersClient({ orders }: { orders: OrderRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('ALL')

  // Stat-card values
  const stats = useMemo(() => {
    const confirmed = orders.filter((o) => o.status === 'CONFIRMED')
    return {
      revenue: confirmed.reduce((s, o) => s + o.totalAmount, 0),
      confirmedCount: confirmed.length,
      needsShipping: orders.filter(
        (o) => o.status === 'CONFIRMED' && o.shippingStatus === 'PENDING_FULFILLMENT'
      ).length,
      failed: orders.filter((o) => o.status === 'FAILED').length
    }
  }, [orders])

  const counts = useMemo(() => {
    const base = Object.fromEntries(FILTERS.map((f) => [f, 0])) as Record<Filter, number>

    const seen = new Set<string>()

    for (const o of orders) {
      // For recurring, only count once per subscription
      if (o.stripeSubscriptionId) {
        if (seen.has(o.stripeSubscriptionId)) continue
        seen.add(o.stripeSubscriptionId)
      }
      base.ALL = (base.ALL ?? 0) + 1
      if (o.type in base) base[o.type as Filter]++
    }

    return base
  }, [orders])

  // Filter then group
  const displayRows = useMemo<DisplayRow[]>(() => {
    const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.type === filter)

    // Group recurring by subscriptionId
    const groups = new Map<string, OrderRow[]>()
    const flat: OrderRow[] = []

    for (const o of filtered) {
      if (o.stripeSubscriptionId) {
        const existing = groups.get(o.stripeSubscriptionId) ?? []
        existing.push(o)
        groups.set(o.stripeSubscriptionId, existing)
      } else {
        flat.push(o)
      }
    }

    const groupRows: GroupRow[] = [...groups.entries()].map(([subscriptionId, orders]) => ({
      kind: 'group',
      subscriptionId,
      orders
    }))

    const flatRows: FlatRow[] = flat.map((o) => ({ kind: 'flat', order: o }))

    // Sort all display rows by latest order date
    return [...groupRows, ...flatRows].sort((a, b) => {
      const aDate =
        a.kind === 'group'
          ? Math.max(...a.orders.map((o) => new Date(o.createdAt).getTime()))
          : new Date(a.order.createdAt).getTime()
      const bDate =
        b.kind === 'group'
          ? Math.max(...b.orders.map((o) => new Date(o.createdAt).getTime()))
          : new Date(b.order.createdAt).getTime()
      return bDate - aDate
    })
  }, [orders, filter])

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Orders" count={{ value: orders.length, noun: 'order' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={DollarSign} label="Revenue" value={fmtCurrency(stats.revenue)} accent />
          <Stat icon={Package} label="Confirmed Orders" value={String(stats.confirmedCount)} />
          <Stat icon={Truck} label="Needs Shipping" value={String(stats.needsShipping)} />
          <Stat icon={XCircle} label="Failed" value={String(stats.failed)} />
        </div>

        <AdminFilterTabs
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          counts={counts}
          labels={FILTER_LABELS}
          label="Filter orders by type"
        />

        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">All orders, newest first</caption>
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {[
                  'Order',
                  'Date',
                  'Customer',
                  'Type',
                  'Items',
                  'Total',
                  'Status',
                  'Shipping',
                  ''
                ].map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-2.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark font-normal whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {displayRows.length === 0 && (
                <tr>
                  <td
                    colSpan={COL_COUNT}
                    className="px-4 py-12 text-center text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
                  >
                    No {FILTER_LABELS[filter].toLowerCase()} orders
                  </td>
                </tr>
              )}
              {displayRows.map((row) =>
                row.kind === 'flat' ? (
                  <tr
                    key={row.order.id}
                    className={`${rowClass(row.order)} cursor-pointer`}
                    onClick={() => router.push(`/admin/orders/${row.order.id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${row.order.id}`}
                        className="text-xs font-mono text-primary-light dark:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                      >
                        #{row.order.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {new Date(row.order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'America/New_York'
                      })}
                    </td>
                    <td className="px-4 py-3 min-w-0 max-w-50">
                      <p className="text-xs font-nunito text-text-light dark:text-text-dark truncate">
                        {row.order.customerName || '—'}
                      </p>
                      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">
                        {row.order.customerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {FILTER_LABELS[row.order.type as Filter] ??
                        row.order.type.replaceAll('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono tabular-nums text-text-light dark:text-text-dark">
                      {row.order.itemCount || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark whitespace-nowrap">
                      {fmtCurrency(row.order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusPill status={row.order.status} />
                    </td>
                    <td className="px-4 py-3 text-[10px] font-mono whitespace-nowrap">
                      {row.order.shippingStatus === 'SHIPPED' ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Shipped</span>
                      ) : row.order.shippingStatus === 'PENDING_FULFILLMENT' ? (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black">
                          <Truck className="w-3 h-3 shrink-0" aria-hidden="true" />
                          Needs shipping
                        </span>
                      ) : (
                        <span className="text-muted-light dark:text-muted-dark">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight
                        className="w-3.5 h-3.5 inline text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
                        aria-hidden="true"
                      />
                    </td>
                  </tr>
                ) : (
                  <SubscriptionGroupRow key={row.subscriptionId} group={row} />
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
