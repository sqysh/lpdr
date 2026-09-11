import { calculateStripeFees } from 'lib/utils/fees.utils'
import type { CartItem } from 'stores/cart.store'

export function useCheckoutTotals(items: CartItem[], coverFees: boolean) {
  const hasPhysical = items.some((i) => i.isPhysicalProduct)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = items.filter((i) => i.isPhysicalProduct).reduce((sum, i) => sum + (i.shippingPrice ?? 0), 0)
  const baseAmount = total + shipping
  const processingFee = calculateStripeFees(baseAmount)
  const feesCovered = coverFees ? processingFee : 0

  return {
    hasPhysical,
    total,
    shipping,
    processingFee,
    finalAmount: Math.round((baseAmount + feesCovered) * 100) / 100
  }
}
