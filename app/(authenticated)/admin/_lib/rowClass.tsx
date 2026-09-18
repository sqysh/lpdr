import { IOrderRow } from 'types/order.types'

export function rowClass(o: IOrderRow) {
  if (!o.userId && !o.customerName && !o.customerEmail)
    return 'group border-l-2 border-l-red-500 bg-red-500/10 hover:bg-red-500/15 transition-colors'

  if (o.status === 'FAILED') return 'group border-l-2 border-l-red-500 bg-red-500/5 hover:bg-red-500/8 transition-colors'

  // Refunded rows are muted rather than flagged: nothing needs doing, they just should not read
  // as money the rescue still has.
  if (o.status === 'REFUNDED')
    return 'group border-l-2 border-l-zinc-400 dark:border-l-zinc-600 bg-zinc-500/5 opacity-60 hover:opacity-100 hover:bg-zinc-500/10 transition-all'

  if (o.status === 'CONFIRMED' && o.shippingStatus === 'PENDING_FULFILLMENT')
    return 'group border-l-2 border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/8 transition-colors'

  return 'group hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors'
}
