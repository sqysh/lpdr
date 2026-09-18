import { getOrders } from 'lib/actions/admin/order/getOrders'
import { AdminSubscriptionsClient } from './AdminSubscriptionsClient'

export default async function AdminSubscriptionsPage() {
  // Every charge is loaded, not just the latest, because a subscription's row is built from its history
  const result = await getOrders({ isRecurring: true, stripeSubscriptionId: { not: null } })
  const orders = result.success ? (result.data ?? []) : []

  return <AdminSubscriptionsClient orders={orders} />
}
