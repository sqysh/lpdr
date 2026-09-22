'use client'

import { useMemo, useState, useTransition } from 'react'
import { DollarSign, Heart, Repeat, ChevronRight, AlertTriangle, Percent, Undo2, Loader2 } from 'lucide-react'
import { DisplayRow, FlatRow, GroupRow, IOrderRow } from 'types/order.types'
import { DONATION_FILTERS, DONATION_FILTER_LABELS, type DonationFilter } from 'lib/constants/order.constants'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import { formatMoney } from 'lib/utils/currency.utils'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { StatusPill } from 'components/_primitives'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from 'lib/utils/date.utils'
import { rowClass } from '../_lib/rowClass'
import { isAnonymous } from '../_lib/isAnonymous'

const COL_COUNT = 7

const latestOf = (orders: IOrderRow[]) => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

export function AdminDonationsClient({ orders }: { orders: IOrderRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<DonationFilter>('ALL')
  const [isPending, startTransition] = useTransition()

  // isPending alone would spin every row, so the clicked id decides which one shows it
  const [openingId, setOpeningId] = useState<string | null>(null)

  const open = (rowId: string, orderId: string) => {
    setOpeningId(rowId)
    startTransition(() => router.push(`/admin/transactions/${orderId}`))
  }

  const stats = useMemo(() => {
    // A refunded donation was real money for a while, so it is counted separately rather than
    // silently dropped: Cathy reconciles against Stripe, where the charge and the refund both appear.
    const confirmed = orders.filter((o) => o.status === 'CONFIRMED')
    const refunded = orders.filter((o) => o.status === 'REFUNDED')

    const gross = confirmed.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    const feesCovered = confirmed.reduce((sum, o) => sum + (o.coverFees ? Number(o.feesCovered) : 0), 0)
    const feesAbsorbed = confirmed.reduce((sum, o) => sum + (o.coverFees ? 0 : Number(o.feesCovered)), 0)

    // Recurring is counted by distinct subscription, not by charge, so the number means donors
    const recurring = new Set(confirmed.filter((o) => o.isRecurring && o.stripeSubscriptionId).map((o) => o.stripeSubscriptionId))

    return {
      gross,
      net: gross - feesCovered - feesAbsorbed,
      feesCovered,
      oneTimeCount: confirmed.filter((o) => !o.isRecurring).length,
      recurringCount: recurring.size,
      refundedCount: refunded.length,
      refundedTotal: refunded.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    }
  }, [orders])

  const counts = useMemo(() => {
    const base: Record<DonationFilter, number> = { ALL: 0, ONE_TIME_DONATION: 0, RECURRING_DONATION: 0 }
    const seen = new Set<string>()

    for (const o of orders) {
      if (o.isRecurring) {
        // A subscription is one donor however many charges it has produced
        const key = o.stripeSubscriptionId ?? o.id
        if (seen.has(key)) continue
        seen.add(key)
        base.RECURRING_DONATION++
      } else {
        base.ONE_TIME_DONATION++
      }
      base.ALL++
    }

    return base
  }, [orders])

  const displayRows = useMemo<DisplayRow[]>(() => {
    const filtered = filter === 'ALL' ? orders : orders.filter((o) => (filter === 'RECURRING_DONATION' ? o.isRecurring : !o.isRecurring))

    const groups = new Map<string, IOrderRow[]>()
    const flat: IOrderRow[] = []

    for (const o of filtered) {
      // Grouping keys on the Stripe id, so a recurring order missing one still renders as its own row
      if (o.isRecurring && o.stripeSubscriptionId) {
        const existing = groups.get(o.stripeSubscriptionId) ?? []
        existing.push(o)
        groups.set(o.stripeSubscriptionId, existing)
      } else {
        flat.push(o)
      }
    }

    const groupRows: GroupRow[] = [...groups.entries()].map(([subscriptionId, orders]) => ({ kind: 'group', subscriptionId, orders }))
    const flatRows: FlatRow[] = flat.map((o) => ({ kind: 'flat', order: o }))

    return [...groupRows, ...flatRows].sort((a, b) => {
      const aDate = a.kind === 'group' ? new Date(latestOf(a.orders).createdAt).getTime() : new Date(a.order.createdAt).getTime()
      const bDate = b.kind === 'group' ? new Date(latestOf(b.orders).createdAt).getTime() : new Date(b.order.createdAt).getTime()
      return bDate - aDate
    })
  }, [orders, filter])

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Donations" count={{ value: counts.ALL, noun: 'donation' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <Stat icon={DollarSign} label="Gross" value={formatMoney(stats.gross)} />
          <Stat icon={DollarSign} label="Net to Rescue" value={formatMoney(stats.net)} accent />
          <Stat icon={Percent} label="Fees Covered" value={formatMoney(stats.feesCovered)} />
          <Stat icon={Heart} label="One-time" value={String(stats.oneTimeCount)} />
          {stats.refundedCount > 0 ? (
            <Stat icon={Undo2} label="Refunded" value={formatMoney(stats.refundedTotal)} />
          ) : (
            <Stat icon={Repeat} label="Monthly Donors" value={String(stats.recurringCount)} />
          )}
        </div>

        <AdminFilterTabs
          options={DONATION_FILTERS}
          value={filter}
          onChange={setFilter}
          counts={counts}
          labels={DONATION_FILTER_LABELS}
          label="Filter donations by frequency"
        />

        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">All donations, newest first</caption>
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {['Order', 'Date', 'Donor', 'Frequency', 'Total', 'Status', ''].map((h, i) => (
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
                    No {filter === 'ALL' ? '' : `${DONATION_FILTER_LABELS[filter].toLowerCase()} `}donations yet
                  </td>
                </tr>
              )}
              {displayRows.map(
                (row) =>
                  row.kind === 'flat' && (
                    <tr
                      key={row.order.id}
                      className={`${rowClass(row.order)} cursor-pointer`}
                      onClick={() => open(row.order.id, row.order.id)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/admin/transactions/${row.order.id}`}
                          onClick={(e) => e.stopPropagation()}
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
                      <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">One-time</td>
                      <td className="px-4 py-3 text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark whitespace-nowrap">
                        {formatMoney(row.order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusPill status={row.order.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isPending && openingId === row.order.id ? (
                          <Loader2
                            className="w-3.5 h-3.5 inline animate-spin text-primary-light dark:text-primary-dark"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronRight
                            className="w-3.5 h-3.5 inline text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
                            aria-hidden="true"
                          />
                        )}
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
