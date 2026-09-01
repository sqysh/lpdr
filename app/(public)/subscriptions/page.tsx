import PublicSubscriptionsClient from 'app/(public)/subscriptions/PublicSubscriptionsClient'
import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'
import { getUserName } from 'lib/actions/my-pack/getUserName'

export default async function PublicSubscriptionsPage() {
  const [paymentMethodsResult, userNameResult] = await Promise.all([
    getSavedPaymentMethods(),
    getUserName()
  ])

  return (
    <PublicSubscriptionsClient
      savedPaymentMethods={paymentMethodsResult.data ?? []}
      userName={userNameResult.data ?? null}
    />
  )
}
