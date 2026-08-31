import { notFound } from 'next/navigation'
import prisma from 'prisma/client'
import { AuctionItemForm } from 'app/(authenticated)/admin/auctions/[id]/[itemId]/_components/AuctionItemForm'
import { SellingFormat } from '@prisma/client'

export default async function AdminAuctionNewItemPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}) {
  const [{ id }, { type }] = await Promise.all([params, searchParams])

  const auction = await prisma.auction.findUnique({
    where: { id },
    select: { id: true, status: true }
  })
  if (!auction) notFound()

  const sellingFormat: SellingFormat = type?.toUpperCase() === 'FIXED' ? 'FIXED' : 'AUCTION'

  return (
    <AuctionItemForm
      auctionItem={null}
      auctionId={id}
      type={sellingFormat}
      auctionStatus={auction.status}
    />
  )
}
