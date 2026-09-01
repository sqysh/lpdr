import AdminDashboardClient from './AdminDashboardClient'
import { getDashboardData } from 'lib/actions/admin/dashboard/getDashboardData'

export default async function AdminDashboardPage() {
  const stats = await getDashboardData()
  return <AdminDashboardClient stats={stats} />
}
