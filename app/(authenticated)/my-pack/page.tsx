import { getPackMemberData } from 'lib/actions/my-pack/getPackMemberData'
import MyPackClient from './MyPackClient'
import { Suspense } from 'react'
import { checkOwnMigrationStatus } from 'lib/actions/user/checkOwnMigrationStatus'
import prisma from 'prisma/client'
import { auth } from 'lib/auth'
import { getCachedNavAuction } from 'lib/actions/public/auction/getCachedNavAuction'

export const dynamic = 'force-dynamic'

export default function MyPackPage() {
  return (
    <Suspense fallback={null}>
      <MyPackContent />
    </Suspense>
  )
}

async function getBannerAuction() {
  const auction = await getCachedNavAuction()
  if (!auction || auction.status !== 'ACTIVE') return null

  const session = await auth()
  const userId = session?.user?.id

  const [itemCount, myBid] = await Promise.all([
    prisma.auctionItem.count({ where: { auctionId: auction.id } }),
    userId ? prisma.auctionBid.findFirst({ where: { auctionId: auction.id, userId }, select: { id: true } }) : null
  ])

  return { ...auction, itemCount, hasBids: !!myBid }
}

async function MyPackContent() {
  const [packMemberResult, migrationResult, bannerAuction] = await Promise.all([
    getPackMemberData(),
    checkOwnMigrationStatus(),
    getBannerAuction()
  ])
  const hasPendingMigration = migrationResult.success ? (migrationResult.data?.pending ?? false) : false

  return (
    <MyPackClient
      user={packMemberResult?.data?.user}
      donations={packMemberResult?.data?.donations}
      subscriptions={packMemberResult?.data?.subscriptions}
      auctionParticipation={packMemberResult?.data?.auctionParticipation}
      paymentMethods={packMemberResult?.data?.paymentMethods}
      adoptionFees={packMemberResult?.data?.adoptionFees}
      multiItemOrders={packMemberResult?.data?.multiItemOrders}
      auctionPurchases={packMemberResult.data?.auctionPurchases}
      hasPendingMigration={hasPendingMigration}
      activeAuction={bannerAuction}
    />
  )
}
