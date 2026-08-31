import { getActiveAuctionItems } from 'lib/actions/public/auction/getActiveAuctionItems'
import { getAuctionItemById } from 'lib/actions/admin/auction/getAuctionItemById'
import PublicAuctionItemClient from './PublicAuctionItemClient'
import { notFound } from 'next/navigation'

export default async function PublicAuctionItemPage({
  params
}: {
  params: Promise<{ auctionItemId: string }>
}) {
  const { auctionItemId } = await params
  const data = await getAuctionItemById(auctionItemId)

  if (!data.success || !data.auctionItem) notFound()

  const auctionId = data.auctionItem.auction.id
  const itemsResult = await getActiveAuctionItems(auctionId)

  return <PublicAuctionItemClient item={data.auctionItem} auctionItems={itemsResult?.data ?? []} />
}
