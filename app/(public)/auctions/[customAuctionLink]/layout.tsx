import { notFound } from 'next/navigation'
import prisma from 'prisma/client'
import { AuctionChannel } from './_components/AuctionChannel'

export default async function AuctionLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ customAuctionLink: string }>
}) {
  const { customAuctionLink } = await params

  // Links use the custom link when there is one and the id otherwise, so either can arrive here
  const auction = await prisma.auction.findFirst({
    where: { OR: [{ customAuctionLink }, { id: customAuctionLink }] },
    select: { id: true }
  })
  if (!auction) notFound()

  return <AuctionChannel auctionId={auction.id}>{children}</AuctionChannel>
}
