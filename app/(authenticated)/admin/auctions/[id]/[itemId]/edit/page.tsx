import { notFound } from 'next/navigation'
import prisma from 'prisma/client'
import { AuctionItemForm } from 'app/(authenticated)/admin/auctions/[id]/[itemId]/_components/AuctionItemForm'
import { serialize } from 'lib/utils/serializers.utils'

export default async function AdminAuctionEditItemPage({
  params
}: {
  params: Promise<{ id: string; itemId: string }>
}) {
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

  const serializedItem = {
    ...item,
    startingPrice: item.startingPrice != null ? Number(item.startingPrice) : null,
    buyNowPrice: item.buyNowPrice != null ? Number(item.buyNowPrice) : null,
    currentPrice: item.currentPrice != null ? Number(item.currentPrice) : null,
    currentBid: item.currentBid != null ? Number(item.currentBid) : null,
    minimumBid: item.minimumBid != null ? Number(item.minimumBid) : null,
    soldPrice: item.soldPrice != null ? Number(item.soldPrice) : null,
    shippingCosts: item.shippingCosts != null ? Number(item.shippingCosts) : null,
    bids: item.bids.map((b) => ({
      ...b,
      bidAmount: Number(b.bidAmount)
    })),
    instantBuyers: serialize(item.instantBuyers)
  }

  return (
    <AuctionItemForm
      auctionItem={serializedItem}
      auctionId={id}
      type={item.sellingFormat}
      auctionStatus={auction.status}
    />
  )
}
