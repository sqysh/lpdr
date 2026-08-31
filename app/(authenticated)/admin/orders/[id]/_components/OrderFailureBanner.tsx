import { AlertCircle } from 'lucide-react'
import { SerializedOrder } from 'types/_order.types'

export function OrderFailureBanner({ order }: { order: SerializedOrder }) {
  if (!order.failureCode && !order.failureReason) return null

  return (
    <div className="w-full px-4 sm:px-6 py-3 flex items-start gap-3 bg-red-500/8 border-b border-red-500/20">
      <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-red-500 dark:text-red-400 font-bold">
          Payment failed
        </p>
        {order.failureReason && (
          <p className="text-xs font-mono text-muted-light dark:text-muted-dark mt-0.5">
            {order.failureReason}
            {order.failureCode && (
              <span className="ml-2 text-[10px] text-muted-light/60 dark:text-muted-dark/60">
                ({order.failureCode})
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
