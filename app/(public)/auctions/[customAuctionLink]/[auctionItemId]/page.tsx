import PublicAuctionItemClient from './PublicAuctionItemClient'
import { notFound } from 'next/navigation'
import { getPublicAuctionItemById } from 'lib/actions/public/auction/getPublicAuctionItemById'

export default async function PublicAuctionItemPage({ params }: { params: Promise<{ auctionItemId: string }> }) {
  const { auctionItemId } = await params
  const data = await getPublicAuctionItemById(auctionItemId)

  if (!data.success || !data.data) notFound()

  return <PublicAuctionItemClient item={data.data} auctionItems={data.data.auction.items} />
}
