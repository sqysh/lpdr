import { Undo2 } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { IOrder } from 'types/order.types'

/**
 * Sits above everything else once money has gone back, because every figure below it still reads
 * as the full amount charged. Covers partial refunds too, which leave the order confirmed.
 */
export function TransactionRefundBanner({ order }: { order: IOrder }) {
  const total = Number(order.totalAmount)
  // Refunds recorded by hand before they were tracked have no amount, so a REFUNDED order counts as its full total
  const refunded = order.refundedAmount != null ? Number(order.refundedAmount) : order.status === 'REFUNDED' ? total : 0

  if (refunded === 0) return null

  const full = refunded >= total

  return (
    <div className="w-full px-4 sm:px-6 pt-6">
      <div className="flex items-start gap-3 px-4 py-3 border border-sky-500/30 bg-sky-500/5">
        <Undo2 size={15} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-f10 font-mono tracking-eyebrow uppercase font-black text-sky-700 dark:text-sky-300">
            {full ? 'This order was refunded' : 'This order was partly refunded'}
          </p>
          <p className="text-f9 font-mono text-muted-light dark:text-muted-dark leading-relaxed mt-0.5">
            {formatMoney(refunded)}
            {!full && ` of ${formatMoney(total)}`} was returned to the customer
            {order.refundedAt && ` on ${formatDate(order.refundedAt)}`}. The amounts below are what was originally charged on{' '}
            {formatDate(order.createdAt, true)}.
          </p>
        </div>
      </div>
    </div>
  )
}
