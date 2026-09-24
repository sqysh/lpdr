'use client'

import { useMemo, useState } from 'react'
import { Package, DollarSign, Truck, XCircle, ChevronRight, AlertTriangle, Percent, Undo2 } from 'lucide-react'
import { DisplayRow, FlatRow, GroupRow, IOrderRow } from 'types/order.types'
import { FILTER_LABELS, FILTERS, type Filter } from 'lib/constants/order.constants'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import { formatMoney } from 'lib/utils/currency.utils'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { StatusPill } from 'components/_primitives'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SubscriptionGroupRow } from './_components/SubscriptionGroupRow'
import { formatDate } from 'lib/utils/date.utils'
import { rowClass } from '../_lib/rowClass'
import { isAnonymous } from '../_lib/isAnonymous'
import { orderDisplayStatus } from 'lib/utils/order.utils'
import { SyncRefundsButton } from './_components/SyncRefundsButton'

const COL_COUNT = 9

export function AdminTransactionsClient({ orders }: { orders: IOrderRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('ALL')

  const stats = useMemo(() => {
    // Money the rescue actually kept. A refunded order was real revenue for a while, so it is
    // counted separately rather than silently dropped: Cathy reconciles against Stripe, where
    // the charge and the refund both appear.
    const confirmed = orders.filter((o) => o.status === 'CONFIRMED')

    // Orders marked refunded by hand before refunds were recorded automatically have no amount
    // stored, so a REFUNDED order without one counts as its full total
    const refundOf = (o: IOrderRow) =>
      o.refundedAmount != null ? Number(o.refundedAmount) : o.status === 'REFUNDED' ? Number(o.totalAmount) : 0
    const refunds = orders.filter((o) => refundOf(o) > 0)

    const gross = confirmed.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    // Partial refunds come off confirmed orders; fully refunded ones are already outside gross
    const partialRefunds = confirmed.reduce((sum, o) => sum + refundOf(o), 0)
    const feesCovered = confirmed.reduce((sum, o) => sum + (o.coverFees ? Number(o.feesCovered) : 0), 0)
    const feesAbsorbed = confirmed.reduce((sum, o) => sum + (o.coverFees ? 0 : Number(o.feesCovered)), 0)

    return {
      gross,
      net: gross - partialRefunds - feesCovered - feesAbsorbed,
      feesCovered,
      feesAbsorbed,
      confirmedCount: confirmed.length,
      refundedCount: refunds.length,
      refundedTotal: refunds.reduce((sum, o) => sum + refundOf(o), 0),
      needsShipping: orders.filter((o) => o.status === 'CONFIRMED' && o.shippingStatus === 'PENDING_FULFILLMENT').length,
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
    const groups = new Map<string, IOrderRow[]>()
    const flat: IOrderRow[] = []

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
        a.kind === 'group' ? Math.max(...a.orders.map((o) => new Date(o.createdAt).getTime())) : new Date(a.order.createdAt).getTime()
      const bDate =
        b.kind === 'group' ? Math.max(...b.orders.map((o) => new Date(o.createdAt).getTime())) : new Date(b.order.createdAt).getTime()
      return bDate - aDate
    })
  }, [orders, filter])

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Transactions" count={{ value: orders.length, noun: 'order' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <Stat icon={DollarSign} label="Gross" value={formatMoney(stats.gross)} />
          <Stat icon={DollarSign} label="Net to Rescue" value={formatMoney(stats.net)} accent />
          <Stat icon={Percent} label="Fees Covered" value={formatMoney(stats.feesCovered)} />
          <Stat icon={Package} label="Confirmed" value={String(stats.confirmedCount)} />
          <Stat icon={Truck} label="Needs Shipping" value={String(stats.needsShipping)} />
          {stats.refundedCount > 0 ? (
            <Stat icon={Undo2} label="Refunded" value={formatMoney(stats.refundedTotal)} />
          ) : (
            <Stat icon={XCircle} label="Failed" value={String(stats.failed)} />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <AdminFilterTabs
            options={FILTERS}
            value={filter}
            onChange={setFilter}
            counts={counts}
            labels={FILTER_LABELS}
            label="Filter orders by type"
          />
          <SyncRefundsButton />
        </div>

        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">All orders, newest first</caption>
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {['Order', 'Date', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Shipping', ''].map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-2.5 text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark font-normal whitespace-nowrap"
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
                    className="px-4 py-12 text-center text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
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
                    onClick={() => router.push(`/admin/transactions/${row.order.id}`)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        href={`/admin/transactions/${row.order.id}`}
                        className="text-xs font-mono text-primary-light dark:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                      >
                        #{row.order.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {formatDate(row.order.createdAt, true)}
                    </td>
                    <td className="px-4 py-3 min-w-0 max-w-50">
                      {isAnonymous(row.order) ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-red-500 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
                          No customer data
                        </span>
                      ) : (
                        <>
                          <p className="text-xs font-nunito text-text-light dark:text-text-dark truncate">
                            {row.order.customerName || '—'}
                          </p>
                          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">
                            {row.order.customerEmail || '—'}
                          </p>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {FILTER_LABELS[row.order.type as Filter] ?? row.order.type.replaceAll('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono tabular-nums text-text-light dark:text-text-dark">
                      {row.order.items.reduce((sum, i) => sum + (i.quantity ?? 1), 0) || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark">
                        {formatMoney(row.order.totalAmount)}
                      </p>
                      {/* A full refund already shows in the status pill; a partial one only shows here */}
                      {row.order.status === 'CONFIRMED' && Number(row.order.refundedAmount ?? 0) > 0 && (
                        <p className="text-[10px] font-mono tabular-nums text-sky-600 dark:text-sky-400">
                          −{formatMoney(Number(row.order.refundedAmount))} refunded
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusPill status={orderDisplayStatus(row.order)} />
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
