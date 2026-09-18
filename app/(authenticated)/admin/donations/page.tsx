import { getOrders } from 'lib/actions/admin/order/getOrders'
import { AdminDonationsClient } from './AdminDonationsClient'
import { DONATION_TYPES } from 'lib/constants/order.constants'

// -04:00 matters: a bare '2026-05-01' parses as UTC midnight, which is 8pm April 30 Eastern
// const DONATIONS_FROM = new Date('2026-07-21T00:00:00-04:00')

export default async function AdminDonationsPage() {
  const result = await getOrders({ type: { in: [...DONATION_TYPES] }, source: 'SITE' })
  const orders = result.success ? (result.data ?? []) : []

  return <AdminDonationsClient orders={orders} />
}
