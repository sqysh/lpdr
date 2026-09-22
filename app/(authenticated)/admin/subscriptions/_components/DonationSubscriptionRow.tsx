'use client'

import { Repeat, ChevronRight, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { StatusPill } from 'components/_primitives'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import type { GroupRow } from 'types/order.types'
import { isAnonymous } from '../../_lib/isAnonymous'

export function DonationSubscriptionRow({ group, pending, onOpen }: { group: GroupRow; pending: boolean; onOpen: (id: string) => void }) {
  // Newest charge stands for the subscription: its status is the current one, and its date is the last payment
  const orders = [...group.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const latest = orders[0]
  const lifetime = orders.filter((o) => o.status === 'CONFIRMED').reduce((sum, o) => sum + Number(o.totalAmount), 0)
  const renewals = orders.length - 1

  return (
    <tr className="group cursor-pointer hover:bg-bg-light dark:hover:bg-bg-dark" onClick={() => onOpen(latest.id)}>
      <td className="px-4 py-3 whitespace-nowrap">
        <Link
          href={`/admin/transactions/${latest.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-mono text-primary-light dark:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          #{latest.id.slice(-8)}
        </Link>
      </td>
      <td className="px-4 py-3 text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
        {formatDate(latest.createdAt, true)}
      </td>
      <td className="px-4 py-3 min-w-0 max-w-50">
        {isAnonymous(latest) ? (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-red-500 dark:text-red-400">
            <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
            No customer data
          </span>
        ) : (
          <>
            <p className="text-xs font-nunito text-text-light dark:text-text-dark truncate">{latest.customerName || '—'}</p>
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">{latest.customerEmail || '—'}</p>
          </>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-primary-light dark:text-primary-dark">
          <Repeat className="w-3 h-3 shrink-0" aria-hidden="true" />
          {latest.recurringFrequency ?? 'Monthly'}
          {latest.tierName && (
            <span className="text-muted-light dark:text-muted-dark normal-case tracking-normal">· {latest.tierName}</span>
          )}
        </span>
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
          {renewals === 0 ? 'First payment' : `${renewals} renewal${renewals === 1 ? '' : 's'}`}
        </p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark">{formatMoney(lifetime)}</p>
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">lifetime</p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusPill status={latest.status} />
      </td>
      <td className="px-4 py-3 text-right">
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 inline animate-spin text-primary-light dark:text-primary-dark" aria-hidden="true" />
        ) : (
          <ChevronRight
            className="w-3.5 h-3.5 inline text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
            aria-hidden="true"
          />
        )}
      </td>
    </tr>
  )
}
