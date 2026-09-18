'use client'

import { useMemo, useState, useTransition } from 'react'
import { DollarSign, Repeat, Users, ChevronRight, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { IOrderRow } from 'types/order.types'
import { SUBSCRIPTION_FILTERS, SUBSCRIPTION_FILTER_LABELS, type SubscriptionFilter } from 'lib/constants/order.constants'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import { formatMoney } from 'lib/utils/currency.utils'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { StatusPill } from 'components/_primitives'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from 'lib/utils/date.utils'
import { isAnonymous } from '../_lib/isAnonymous'

const COL_COUNT = 8

// A subscription is only ended once its newest charge failed or was refunded; a confirmed
// latest charge means it is still billing, whatever happened earlier in its history
type Subscription = {
  subscriptionId: string
  latest: IOrderRow
  first: IOrderRow
  charges: number
  lifetime: number
  isActive: boolean
}

function buildSubscriptions(orders: IOrderRow[]): Subscription[] {
  const groups = new Map<string, IOrderRow[]>()

  for (const o of orders) {
    if (!o.stripeSubscriptionId) continue
    const existing = groups.get(o.stripeSubscriptionId) ?? []
    existing.push(o)
    groups.set(o.stripeSubscriptionId, existing)
  }

  return [...groups.entries()]
    .map(([subscriptionId, rows]) => {
      const sorted = [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      const latest = sorted[0]

      return {
        subscriptionId,
        latest,
        first: sorted[sorted.length - 1],
        charges: sorted.filter((o) => o.status === 'CONFIRMED').length,
        lifetime: sorted.filter((o) => o.status === 'CONFIRMED').reduce((sum, o) => sum + Number(o.totalAmount), 0),
        isActive: latest.status === 'CONFIRMED'
      }
    })
    .sort((a, b) => new Date(b.latest.createdAt).getTime() - new Date(a.latest.createdAt).getTime())
}

export function AdminSubscriptionsClient({ orders }: { orders: IOrderRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<SubscriptionFilter>('ALL')
  const [isPending, startTransition] = useTransition()
  const [openingId, setOpeningId] = useState<string | null>(null)

  const open = (subscriptionId: string, orderId: string) => {
    setOpeningId(subscriptionId)
    startTransition(() => router.push(`/admin/transactions/${orderId}`))
  }

  const subscriptions = useMemo(() => buildSubscriptions(orders), [orders])

  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.isActive)

    return {
      // What the rescue can expect next month if nobody cancels
      monthly: active.reduce((sum, s) => sum + Number(s.latest.totalAmount), 0),
      activeCount: active.length,
      endedCount: subscriptions.length - active.length,
      lifetime: subscriptions.reduce((sum, s) => sum + s.lifetime, 0)
    }
  }, [subscriptions])

  const counts = useMemo(
    () => ({
      ALL: subscriptions.length,
      ACTIVE: subscriptions.filter((s) => s.isActive).length,
      ENDED: subscriptions.filter((s) => !s.isActive).length
    }),
    [subscriptions]
  )

  const rows = useMemo(
    () => (filter === 'ALL' ? subscriptions : subscriptions.filter((s) => (filter === 'ACTIVE' ? s.isActive : !s.isActive))),
    [subscriptions, filter]
  )

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Subscriptions" count={{ value: subscriptions.length, noun: 'subscription' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={Repeat} label="Monthly Recurring" value={formatMoney(stats.monthly)} accent />
          <Stat icon={Users} label="Active" value={String(stats.activeCount)} />
          <Stat icon={DollarSign} label="Lifetime" value={formatMoney(stats.lifetime)} />
          <Stat icon={XCircle} label="Ended" value={String(stats.endedCount)} />
        </div>

        <AdminFilterTabs
          options={SUBSCRIPTION_FILTERS}
          value={filter}
          onChange={setFilter}
          counts={counts}
          labels={SUBSCRIPTION_FILTER_LABELS}
          label="Filter subscriptions by state"
        />

        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">All subscriptions, most recent payment first</caption>
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {['Latest', 'Donor', 'Tier', 'Amount', 'Payments', 'Lifetime', 'Status', ''].map((h, i) => (
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
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={COL_COUNT}
                    className="px-4 py-12 text-center text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
                  >
                    No {filter === 'ALL' ? '' : `${SUBSCRIPTION_FILTER_LABELS[filter].toLowerCase()} `}subscriptions yet
                  </td>
                </tr>
              )}
              {rows.map((s) => (
                <tr
                  key={s.subscriptionId}
                  className="group cursor-pointer hover:bg-bg-light dark:hover:bg-bg-dark"
                  onClick={() => open(s.subscriptionId, s.latest.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/transactions/${s.latest.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-mono text-primary-light dark:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      {formatDate(s.latest.createdAt, true)}
                    </Link>
                    <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">since {formatDate(s.first.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 min-w-0 max-w-50">
                    {isAnonymous(s.latest) ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-red-500 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
                        No customer data
                      </span>
                    ) : (
                      <>
                        <p className="text-xs font-nunito text-text-light dark:text-text-dark truncate">{s.latest.customerName || '—'}</p>
                        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">
                          {s.latest.customerEmail || '—'}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                    {s.latest.tierName || '—'}
                    {s.latest.recurringFrequency && <span className="block tracking-widest uppercase">{s.latest.recurringFrequency}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono tabular-nums text-text-light dark:text-text-dark whitespace-nowrap">
                    {formatMoney(s.latest.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono tabular-nums text-muted-light dark:text-muted-dark">{s.charges}</td>
                  <td className="px-4 py-3 text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark whitespace-nowrap">
                    {formatMoney(s.lifetime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusPill status={s.latest.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isPending && openingId === s.subscriptionId ? (
                      <Loader2 className="w-3.5 h-3.5 inline animate-spin text-primary-light dark:text-primary-dark" aria-hidden="true" />
                    ) : (
                      <ChevronRight
                        className="w-3.5 h-3.5 inline text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
                        aria-hidden="true"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
