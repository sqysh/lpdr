import { getAuctionByCustomAuctionLink } from 'lib/actions/public/auction/getAuctionByCustomAuctionLink'
import { notFound } from 'next/navigation'
import PublicAuctionClient from './PublicAuctionClient'
import { getMyBidsForAuction } from 'lib/actions/public/auction/getMyBidsForAuction'

export default async function PublicAuctionPage({ params }: { params: Promise<{ customAuctionLink: string }> }) {
  const { customAuctionLink } = await params
  const result = await getAuctionByCustomAuctionLink(customAuctionLink)

  if (!result.success || !result.data) notFound()

  const myBids = await getMyBidsForAuction(result.data.id)

  return <PublicAuctionClient auction={result.data} myBids={myBids} />
}
