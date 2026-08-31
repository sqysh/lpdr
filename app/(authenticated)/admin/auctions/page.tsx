import AdminAuctionsClient from 'app/(authenticated)/admin/auctions/AdminAuctionsClient'
import getAuctions from 'lib/actions/public/auction/getAuctions'

export default async function AdminAuctionsPage() {
  const auctions = await getAuctions({ status: ['DRAFT', 'ACTIVE', 'ENDED'] })
  return <AdminAuctionsClient auctions={auctions} />
}
