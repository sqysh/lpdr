import { Undo2 } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { IOrder } from 'types/order.types'

/**
 * Sits above everything else on a refunded order, because every figure below it still reads as
 * money the rescue has. Stripe is the record of the refund itself; this only says that it
 * happened, so nobody reconciles the page against a statement and finds a charge missing.
 */
export function TransactionRefundBanner({ order }: { order: IOrder }) {
  if (order.status !== 'REFUNDED') return null

  return (
    <div className="w-full px-4 sm:px-6 pt-6">
      <div className="flex items-start gap-3 px-4 py-3 border border-zinc-400/40 dark:border-zinc-600/40 bg-zinc-500/5">
        <Undo2 size={15} className="text-muted-light dark:text-muted-dark shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-f10 font-mono tracking-eyebrow uppercase font-black text-text-light dark:text-text-dark">
            This order was refunded
          </p>
          <p className="text-f9 font-mono text-muted-light dark:text-muted-dark leading-relaxed mt-0.5">
            {formatMoney(Number(order.totalAmount))} was returned to the customer. The amounts below are what was originally charged on{' '}
            {formatDate(order.createdAt, true)}, and the refund itself is recorded in Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}
