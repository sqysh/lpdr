import getPublicAuctions from 'lib/actions/public/auction/getPublicAuctions'
import PublicAuctionsClient from './PublicAuctionsClient'

export default async function PublicAuctionsPage() {
  const result = await getPublicAuctions()

  return <PublicAuctionsClient auctions={result.data ?? []} />
}
