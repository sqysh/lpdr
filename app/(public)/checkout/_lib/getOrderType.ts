import { OrderType } from '@prisma/client'
import { CartItem } from 'lib/store/slices/cartSlice'

export function getOrderType(items: CartItem[]): OrderType {
  return items.length > 0 ? OrderType.PURCHASE : OrderType.ONE_TIME_DONATION
}
