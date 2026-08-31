import { getUserAddress } from 'app/lib/actions/my-pack/getUserAddress'
import { getUserName } from 'app/lib/actions/my-pack/getUserName'
import { auth } from 'app/lib/auth'
import { PublicCheckoutClient } from './PublicCheckoutClient'
import { IPaymentMethod } from 'types/_payment-method.types'
import { getSavedPaymentMethods } from 'app/lib/actions/_stripe/getSavedPaymentMethods'

export default async function PublicCheckoutPage() {
  const session = await auth()
  const isAuthed = !!session?.user?.id

  // Logged-out users still reach checkout — the client renders an inline sign-in
  // step. Only fetch user-scoped data when we actually have a user.
  const [savedPaymentMethods, userAddress, userName] = isAuthed
    ? await Promise.all([
        getSavedPaymentMethods().catch(() => ({ success: false, data: [] as IPaymentMethod[] })),
        getUserAddress().catch(() => ({ success: false, data: undefined })),
        getUserName().catch(() => ({ success: false, data: undefined }))
      ])
    : [
        { success: true, data: [] as IPaymentMethod[] },
        { success: true, data: undefined },
        { success: true, data: undefined }
      ]

  return (
    <PublicCheckoutClient
      savedCards={savedPaymentMethods.data ?? []}
      userAddress={userAddress?.data}
      userName={userName?.data}
      isAuthed={isAuthed}
      email={session?.user?.email ?? null}
    />
  )
}
