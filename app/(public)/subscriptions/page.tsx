import PublicSubscriptionsClient from 'app/(public)/subscriptions/PublicSubscriptionsClient'
import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'
import { getUserName } from 'lib/actions/my-pack/getUserName'
import { auth } from 'lib/auth'

export const dynamic = 'force-dynamic'

export default async function PublicSubscriptionsPage() {
  const session = await auth()
  const isAuthed = !!session?.user?.id

  const [paymentMethodsResult, userNameResult] = isAuthed
    ? await Promise.all([
        getSavedPaymentMethods().catch(() => ({ success: false, data: [] })),
        getUserName().catch(() => ({ success: false, data: null }))
      ])
    : [
        { success: true, data: [] },
        { success: true, data: null }
      ]

  return (
    <PublicSubscriptionsClient
      savedPaymentMethods={paymentMethodsResult?.data ?? []}
      userName={userNameResult?.data ?? null}
    />
  )
}
