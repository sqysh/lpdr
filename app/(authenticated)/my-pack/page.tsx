import { getPackMemberData } from 'app/lib/actions/my-pack/getPackMemberData'
import MyPackClient from './MyPackClient'
import { Suspense } from 'react'
import { MyPackSkeleton } from 'app/components/my-pack/MyPack'
import { checkOwnMigrationStatus } from 'app/lib/actions/user/checkOwnMigrationStatus'

export const dynamic = 'force-dynamic'

export default async function MyPackPage() {
  const [packMemberResult, migrationResult] = await Promise.all([
    getPackMemberData(),
    checkOwnMigrationStatus()
  ])
  const hasPendingMigration = migrationResult.success
    ? (migrationResult.data?.pending ?? false)
    : false

  return (
    <Suspense fallback={<MyPackSkeleton />}>
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
      />
    </Suspense>
  )
}
