import { Suspense } from 'react'
import { getPackMemberData } from 'lib/actions/my-pack/getPackMemberData'
import { checkOwnMigrationStatus } from 'lib/actions/user/checkOwnMigrationStatus'
import MyPackClient from './MyPackClient'
import { getFeaturedAuction } from 'lib/actions/my-pack/getFeaturedAuction'

export default function MyPackPage() {
  return (
    <Suspense fallback={null}>
      <MyPackContent />
    </Suspense>
  )
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
      adoptionAgreements={data.adoptions.success ? data.adoptions.data : []}
    />
  )
}
