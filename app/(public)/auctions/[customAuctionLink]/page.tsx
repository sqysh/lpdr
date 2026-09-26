import { getAuctionByCustomAuctionLink } from 'lib/actions/public/auction/getAuctionByCustomAuctionLink'
import { notFound } from 'next/navigation'
import PublicAuctionClient from './PublicAuctionClient'
import { getMyBidsForAuction } from 'lib/actions/public/auction/getMyBidsForAuction'
import { auth } from 'lib/auth'
import prisma from 'prisma/client'

export default async function PublicAuctionPage({ params }: { params: Promise<{ customAuctionLink: string }> }) {
  const { customAuctionLink } = await params
  const [result, session] = await Promise.all([getAuctionByCustomAuctionLink(customAuctionLink), auth()])

  if (!result.success || !result.data) notFound()

  const myBids = await getMyBidsForAuction(result.data.id)

  const autoPayStatus = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          autoPay: true,
          autoPayCoverFees: true,
          address: { select: { addressLine1: true } },
          _count: { select: { paymentMethods: true } }
        }
      })
    : null

  const watchedIds = session?.user?.id
    ? (
        await prisma.auctionItemWatch.findMany({
          where: { userId: session.user.id, auctionItem: { auctionId: result.data.id } },
          select: { auctionItemId: true }
        })
      ).map((w) => w.auctionItemId)
    : []

  return (
    <PublicAuctionClient
      auction={result.data}
      myBids={myBids}
      autoPay={
        autoPayStatus
          ? {
              enabled: autoPayStatus.autoPay,
              coversFees: autoPayStatus.autoPayCoverFees,
              hasCard: autoPayStatus._count.paymentMethods > 0,
              hasAddress: !!autoPayStatus.address?.addressLine1
            }
          : null
      }
      isAuthed={!!session?.user}
      role={session?.user?.role ?? null}
      watchedIds={watchedIds}
    />
  )
}
