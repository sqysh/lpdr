import { CreditCard, AlertCircle } from 'lucide-react'
import { SerializedOrder } from 'types/_order.types'
import { Label } from './OrderLabel'

export function OrderPaymentSection({ order }: { order: SerializedOrder }) {
  return (
    <section
      aria-labelledby="payment-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
        <h2
          id="payment-heading"
          className="flex items-center gap-2 font-quicksand font-black text-sm text-text-light dark:text-text-dark"
        >
          <CreditCard
            className="w-4 h-4 text-primary-light dark:text-primary-dark"
            aria-hidden="true"
          />
          Payment
        </h2>
      </div>
      <div className="px-4 py-4 space-y-3">
        <div>
          <Label>Type</Label>
          <p className="text-xs font-mono text-text-light dark:text-text-dark mt-1">
            {order.type.replaceAll('_', ' ')}
          </p>
        </div>
        <div>
          <Label>Placed</Label>
          <p className="text-xs font-mono text-text-light dark:text-text-dark mt-1">
            {new Date(order.createdAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        </div>
        {order.paymentIntentId && (
          <div>
            <Label>Payment intent</Label>
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-1 break-all">
              {order.paymentIntentId}
            </p>
          </div>
        )}
        {order.failureEmailSentAt && (
          <div>
            <Label>Failure email sent</Label>
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-1">
              {new Date(order.failureEmailSentAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </p>
          </div>
        )}
        {(order.failureCode || order.failureReason) && (
          <div className="border border-red-500/30 bg-red-500/5 px-3 py-3 space-y-2">
            <p className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-red-500 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Payment failed
            </p>
            {order.failureCode && (
              <div>
                <Label>Code</Label>
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                  {order.failureCode}
                </p>
              </div>
            )}
            {order.failureReason && (
              <div>
                <Label>Reason</Label>
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                  {order.failureReason}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
