import { Suspense } from 'react'
import prisma from 'prisma/client'
import { auth } from 'lib/auth'
import { getPackMemberData } from 'lib/actions/my-pack/getPackMemberData'
import { checkOwnMigrationStatus } from 'lib/actions/user/checkOwnMigrationStatus'
import { getCachedNavAuction } from 'lib/actions/public/auction/getCachedNavAuction'
import MyPackClient from './MyPackClient'

// Everything here reads the session, so there is nothing to prerender.
export const dynamic = 'force-dynamic'

export default function MyPackPage() {
  return (
    <Suspense fallback={null}>
      <MyPackContent />
    </Suspense>
  )
}

/**
 * A live auction, or an upcoming one the crew has made public. A pack member is already engaged
 * enough that telling them an auction opens on the 26th is worth as much as telling them it is
 * open now, so the banner covers both and says which.
 */
async function getFeaturedAuction() {
  const auction = await getCachedNavAuction()
  if (!auction) return null

  const isLive = auction.status === 'ACTIVE'
  const isUpcoming = auction.status === 'DRAFT' && auction.isPubliclyVisible

  if (!isLive && !isUpcoming) return null

  const session = await auth()
  const userId = session?.user?.id

  const [itemCount, myBid] = await Promise.all([
    prisma.auctionItem.count({ where: { auctionId: auction.id } }),
    // Only a live auction can have bids, so the lookup is skipped on an upcoming one.
    isLive && userId
      ? prisma.auctionBid.findFirst({ where: { auctionId: auction.id, userId }, select: { id: true } })
      : Promise.resolve(null)
  ])

  return { ...auction, itemCount, isLive, hasBids: !!myBid }
}

async function MyPackContent() {
  const [packMember, migration, featuredAuction] = await Promise.all([getPackMemberData(), checkOwnMigrationStatus(), getFeaturedAuction()])

  const data = packMember?.data

  return (
    <MyPackClient
      user={data?.user}
      donations={data?.donations}
      subscriptions={data?.subscriptions}
      auctionParticipation={data?.auctionParticipation}
      paymentMethods={data?.paymentMethods}
      adoptionFees={data?.adoptionFees}
      multiItemOrders={data?.multiItemOrders}
      auctionPurchases={data?.auctionPurchases}
      hasPendingMigration={migration.success ? (migration.data?.pending ?? false) : false}
      featuredAuction={featuredAuction}
    />
  )
}
