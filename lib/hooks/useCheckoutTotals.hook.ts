import { calculateStripeFees } from 'lib/utils/fees.utils'
import { shippingForLines } from 'lib/utils/shipping.utils'
import type { CartItem } from 'stores/cart.store'

export function useCheckoutTotals(items: CartItem[], coverFees: boolean) {
  const hasPhysical = items.some((i) => i.isPhysicalProduct)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = shippingForLines(items.filter((i) => i.isPhysicalProduct))
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
