import PublicSubscriptionsClient from 'app/(public)/subscriptions/PublicSubscriptionsClient'
import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'
import { getUserName } from 'lib/actions/my-pack/getUserName'
import { auth } from 'lib/auth'

export default async function PublicSubscriptionsPage() {
  const [paymentMethodsResult, userNameResult, session] = await Promise.all([getSavedPaymentMethods(), getUserName(), auth()])

  return (
    <PublicSubscriptionsClient
      key={session?.user?.id ?? 'signed-out'}
      savedPaymentMethods={paymentMethodsResult.data ?? []}
      userName={userNameResult.data ?? null}
      isAuthed={!!session?.user?.id}
    />
  )
}
