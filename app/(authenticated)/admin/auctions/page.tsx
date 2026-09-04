import AdminAuctionsClient from 'app/(authenticated)/admin/auctions/AdminAuctionsClient'
import getAuctions from 'lib/actions/public/auction/getAuctions'

export default async function AdminAuctionsPage() {
  const result = await getAuctions({ status: ['DRAFT', 'ACTIVE', 'ENDED'] })
  return <AdminAuctionsClient auctions={result.data} />
}
