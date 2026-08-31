import AdminDachshundsClient from 'app/(authenticated)/admin/dachshunds/AdminDachshundsClient'
import { getDachshundsByStatus } from 'lib/actions/_rescue-groups/getDachshundsByStatus'

export default async function AdminDachshundsPage() {
  const [availableResult, holdResult] = await Promise.all([
    getDachshundsByStatus({
      status: 'Available',
      currentPage: 1,
      pageLimit: 250,
      source: 'admin-dachshunds-available'
    }),
    getDachshundsByStatus({
      status: 'Hold',
      currentPage: 1,
      pageLimit: 250,
      source: 'admin-dachshunds-hold'
    })
  ])

  const available = availableResult?.data?.data
  const hold = holdResult?.data?.data

  return <AdminDachshundsClient available={available} hold={hold} />
}
