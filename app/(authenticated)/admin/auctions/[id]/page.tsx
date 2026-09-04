import { getAuctionById } from 'lib/actions/admin/auction/getAuctionById'
import { requireAdminPage } from 'lib/auth/guards'
import { notFound } from 'next/navigation'
import AdminAuctionClient from './AdminAuctionClient'

export default async function AdminAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const gate = await requireAdminPage()
  const result = await getAuctionById(id)

  if (!result.success || !result.data) notFound()

  return <AdminAuctionClient auction={result.data} role={gate.role} />
}
