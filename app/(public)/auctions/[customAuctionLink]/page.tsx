import { getAuctionByCustomAuctionLink } from 'lib/actions/public/auction/getAuctionByCustomAuctionLink'
import { notFound } from 'next/navigation'
import PublicAuctionClient from './PublicAuctionClient'

export default async function PublicAuctionPage({
  params
}: {
  params: Promise<{ customAuctionLink: string }>
}) {
  const { customAuctionLink } = await params
  const result = await getAuctionByCustomAuctionLink(customAuctionLink)
  if (!result.success || !result.data) notFound()
  return <PublicAuctionClient auction={result.data} />
}
