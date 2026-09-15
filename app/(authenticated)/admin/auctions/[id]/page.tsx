import { getAuctionById } from 'lib/actions/admin/auction/getAuctionById'
import { notFound } from 'next/navigation'
import AdminAuctionClient from './AdminAuctionClient'
import { getAuctionSignups } from 'lib/actions/admin/auction/getAuctionSignups'
import { auth } from 'lib/auth'

export default async function AdminAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [auction, signups, session] = await Promise.all([getAuctionById(id), getAuctionSignups(id), auth()])

  if (!auction.success || !auction.data) notFound()

  const role = session?.user?.role

  return <AdminAuctionClient auction={auction.data} role={role} signups={signups} />
}
