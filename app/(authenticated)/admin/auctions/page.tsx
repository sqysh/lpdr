import AdminAuctionsClient from 'app/(authenticated)/admin/auctions/AdminAuctionsClient'
import getAuctions from 'lib/actions/admin/auction/getAuctions'
import { requireAdminPage } from 'lib/auth/guards'

export default async function AdminAuctionsPage() {
  await requireAdminPage()

  const result = await getAuctions({ status: ['DRAFT', 'ACTIVE', 'ENDED'] })

  return <AdminAuctionsClient auctions={result.data ?? []} />
}
