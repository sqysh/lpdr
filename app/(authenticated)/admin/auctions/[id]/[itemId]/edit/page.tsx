import { notFound } from 'next/navigation'
import prisma from 'prisma/client'
import { AuctionItemForm } from 'app/(authenticated)/admin/auctions/[id]/[itemId]/_components/AuctionItemForm'
import { serialize } from 'lib/utils/serializers.utils'

export default async function AdminAuctionItemEditPage({ params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { id, itemId } = await params

  const auction = await prisma.auction.findUnique({
    where: { id },
    select: { id: true, status: true }
  })
  if (!auction) notFound()

  const item = await prisma.auctionItem.findUnique({
    where: { id: itemId },
    include: { photos: true, bids: { orderBy: { createdAt: 'desc' } }, instantBuyers: true }
  })
  if (!item || item.auctionId !== id) notFound()

  return <AuctionItemForm auctionItem={serialize(item)} auctionId={id} type={item.sellingFormat} auctionStatus={auction.status} />
}
