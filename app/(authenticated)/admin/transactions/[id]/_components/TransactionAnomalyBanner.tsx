import { Info } from 'lucide-react'
import { IOrder } from 'types/order.types'

export function TransactionAnomalyBanner({ order }: { order: IOrder }) {
  const noIdentity = !order.userId && !order.customerName && !order.customerEmail
  if (!noIdentity) return null

  return (
    <div className="w-full px-4 sm:px-6 py-3 flex items-start gap-3 bg-amber-500/8 border-b border-amber-500/20">
      <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] font-mono tracking-eyebrow uppercase text-amber-600 dark:text-amber-400 font-bold">Not a real order</p>
        <p className="text-xs font-mono text-muted-light dark:text-muted-dark mt-0.5 leading-relaxed">
          This one has no name, email, or account attached, which means no actual person placed it. It is an automated attempt that the site
          blocked. No money changed hands and nothing was charged. You can ignore this order entirely, and no follow up is needed.
        </p>
      </div>
    </div>
  )
}
