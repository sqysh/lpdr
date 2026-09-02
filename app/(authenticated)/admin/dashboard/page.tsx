import { getSupporterLocations } from 'lib/actions/admin/dashboard/getSupporterLocations'
import { getPendingShipments } from 'lib/actions/admin/dashboard/queries/getPendingShipments'
import { AdminDashboardClient } from './AdminDashboardClient'
import { getTopSupporters } from 'lib/actions/admin/dashboard/queries/getTopSupporters'
import { requireAdmin } from 'lib/auth/guards'
import { getTotalRevenue } from 'lib/actions/admin/dashboard/queries/getTotalRevenue'
import { getOrderMetrics } from 'lib/actions/admin/dashboard/queries/getOrderMetrics'

export default async function AdminDashboardPage() {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: 'Unauthorized' }

  const [locations, shipments, topSupporters, totalRevenue, orderMetrics] = await Promise.all([
    getSupporterLocations(),
    getPendingShipments(),
    getTopSupporters(),
    getTotalRevenue(),
    getOrderMetrics()
  ])

  return (
    <AdminDashboardClient
      points={locations.success ? locations.data.points : []}
      regionCounts={locations.success ? locations.data.regionCounts : []}
      shipments={shipments.success ? shipments.data : []}
      supporters={topSupporters.success ? topSupporters.data : []}
      totalRevenue={totalRevenue}
      orderMetrics={orderMetrics.data}
    />
  )
}
