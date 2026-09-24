/**
 * The status to show for an order. A partial refund leaves the stored status CONFIRMED, since the rest
 * of the money was kept, but showing only that would hide that anything went back.
 */
export function orderDisplayStatus(order: { status: string; totalAmount: number | string; refundedAmount?: number | string | null }) {
  const refunded = Number(order.refundedAmount ?? 0)
  if (order.status === 'CONFIRMED' && refunded > 0 && refunded < Number(order.totalAmount)) return 'PARTIALLY_REFUNDED'
  return order.status
}
