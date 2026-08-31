import { getAuctionItemById } from 'lib/actions/admin/auction/getAuctionItemById'
import AdminAuctionItemViewClient from './AdminAuctionItemViewClient'

export default async function AdminAuctionItemViewPage({
  params
}: {
  params: Promise<{ itemId: string }>
}) {
  const { itemId } = await params
  const data = await getAuctionItemById(itemId)
  return <AdminAuctionItemViewClient auctionItem={data?.auctionItem} />
}
