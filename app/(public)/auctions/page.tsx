import getAuctions from 'lib/actions/public/auction/getAuctions'
import PublicAuctionsClient from './PublicAuctionsClient'

export default async function PublicAuctionsPage() {
  const result = await getAuctions({ status: ['DRAFT', 'ACTIVE', 'ENDED'] })
  return <PublicAuctionsClient auctions={result.data} />
}
