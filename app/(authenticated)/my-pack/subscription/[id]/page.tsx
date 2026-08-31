import MyPackSubscriptionClient from 'app/(authenticated)/my-pack/subscription/[id]/MyPackSubscriptionClient'
import { MyPackSubscriptionSkeleton } from 'app/components/my-pack/MyPackSubscriptionSkeleton'
import { getSubscriptionById } from 'lib/actions/my-pack/getSubscriptionById'
import { Suspense } from 'react'

export default async function MyPackSubscriptionPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getSubscriptionById(id)
  return (
    <Suspense fallback={<MyPackSubscriptionSkeleton />}>
      <MyPackSubscriptionClient subscription={result?.data} />
    </Suspense>
  )
}
