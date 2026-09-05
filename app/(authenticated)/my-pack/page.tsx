import { getPackMemberData } from 'lib/actions/my-pack/getPackMemberData'
import MyPackClient from './MyPackClient'
import { Suspense } from 'react'
import { MyPackSkeleton } from 'app/(authenticated)/my-pack/_components/MyPackSkeleton'
import { checkOwnMigrationStatus } from 'lib/actions/user/checkOwnMigrationStatus'

export const dynamic = 'force-dynamic'

export default function MyPackPage() {
  return (
    <Suspense fallback={<MyPackSkeleton />}>
      <MyPackContent />
    </Suspense>
  )
}

async function MyPackContent() {
  const [packMemberResult, migrationResult] = await Promise.all([getPackMemberData(), checkOwnMigrationStatus()])
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
    />
  )
}
