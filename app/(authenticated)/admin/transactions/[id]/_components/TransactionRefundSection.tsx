import { RefundPanel } from 'components/features/payment/RefundPanel'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import Link from 'next/link'
import type { IOrder } from 'types/order.types'

export function TransactionRefundSection({ order }: { order: IOrder }) {
  const total = Number(order.totalAmount)
  const refunded = Number(order.refundedAmount ?? 0)
  const remaining = total - refunded

  // Nothing to refund on a payment that never went through, and offline payments go back the way they came
  if (order.status !== 'CONFIRMED' && refunded === 0) return null

  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <h2 className="px-4 py-2.5 border-b border-border-light dark:border-border-dark text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
        Refund
      </h2>
      <div className="px-4 py-3 space-y-3">
        {refunded > 0 && (
          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
            Refunded {formatMoney(refunded)}
            {order.refundedAt && ` on ${formatDate(order.refundedAt)}`} of {formatMoney(total)}
          </p>
        )}

        {order.type === 'ADOPTION_AGREEMENT' && order.adoptionAgreement && remaining > 0 && (
          <Link
            href={`/admin/adoption-agreements/${order.adoptionAgreement.id}`}
            className="block text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark hover:underline"
          >
            Refund from the agreement to split by fee
          </Link>
        )}

        {remaining > 0 &&
          (order.paymentIntentId ? (
            <RefundPanel orderId={order.id} remaining={remaining} />
          ) : (
            <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
              Paid outside Stripe, so any refund goes back the same way it was paid.
            </p>
          ))}
      </div>
    </section>
  )
}
