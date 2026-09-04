import { getAuctionByCustomAuctionLink } from 'lib/actions/public/auction/getAuctionByCustomAuctionLink'
import { notFound } from 'next/navigation'
import PublicAuctionClient from './PublicAuctionClient'

type Props = {
  params: Promise<{ customAuctionLink: string }>
}

export default async function PublicAuctionPage({ params }: Props) {
  const { customAuctionLink } = await params
  const result = await getAuctionByCustomAuctionLink(customAuctionLink)

  if (!result.success || !result.data) notFound()

  return <PublicAuctionClient auction={result.data} />
}
