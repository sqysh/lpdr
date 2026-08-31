import { getAuctionById } from 'lib/actions/admin/auction/getAuctionById'
import AdminAuctionClient from './AdminAuctionClient'

export default async function AdminAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getAuctionById(id)
  return <AdminAuctionClient auction={result?.data} />
}
