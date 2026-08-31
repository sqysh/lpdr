import { OrderType } from '@prisma/client'
import { CartItem } from 'lib/store/slices/cartSlice'
import { OrderRow } from 'types/_order.types'

export function getOrderType(items: CartItem[]): OrderType {
  return items.length > 0 ? OrderType.PURCHASE : OrderType.ONE_TIME_DONATION
}

export function rowClass(o: OrderRow) {
  if (o.status === 'FAILED')
    return 'group border-l-2 border-l-red-500 bg-red-500/5 hover:bg-red-500/8 transition-colors'
  if (o.status === 'CONFIRMED' && o.shippingStatus === 'PENDING_FULFILLMENT')
    return 'group border-l-2 border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/8 transition-colors'
  return 'group hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors'
}
