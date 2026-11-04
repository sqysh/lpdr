import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'
import { getUserName } from 'lib/actions/my-pack/getUserName'
import { auth } from 'lib/auth'
import { getMemorialSettings } from 'lib/memorial/getMemorialSetting'
import { notFound } from 'next/navigation'
import RainbowBridgeRememberClient from './RainbowBridgeRememberClient'

export default async function RainbowBridgeRememberPage() {
  const settings = await getMemorialSettings()
  if (!settings.isEnabled) notFound()

  const session = await auth()
  const user = session?.user
  const isAuthed = !!user?.id

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
    <RainbowBridgeRememberClient
      settings={{
        fixedAmount: settings.fixedAmount == null ? null : Number(settings.fixedAmount),
        minAmount: Number(settings.minAmount),
        suggestedAmounts: settings.suggestedAmounts.map(Number),
        allowMessage: settings.allowMessage,
        messageMaxLength: settings.messageMaxLength,
        allowDonorName: settings.allowDonorName,
        requireApproval: settings.requireApproval,
        displayDays: settings.displayDays,
        allowPhoto: settings.allowPhoto
      }}
      savedCards={paymentMethodsResult.data ?? []}
      userName={userNameResult.data ?? null}
      isAuthed={isAuthed}
      email={user?.email ?? null}
      userId={user?.id ?? null}
    />
  )
}
