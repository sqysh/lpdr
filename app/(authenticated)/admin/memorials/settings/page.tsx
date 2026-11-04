import { getMemorialSettings } from 'lib/memorial/getMemorialSetting'
import { AdminMemorialSettingsClient } from './AdminMemorialSettingsClient'

export default async function AdminMemorialSettingsPage() {
  const s = await getMemorialSettings()

  return (
    <AdminMemorialSettingsClient
      settings={{
        isEnabled: s.isEnabled,
        fixedAmount: s.fixedAmount == null ? null : Number(s.fixedAmount),
        minAmount: Number(s.minAmount),
        suggestedAmounts: s.suggestedAmounts.map(Number),
        allowMessage: s.allowMessage,
        messageMaxLength: s.messageMaxLength,
        allowPhoto: s.allowPhoto,
        allowDonorName: s.allowDonorName,
        requireApproval: s.requireApproval,
        displayDays: s.displayDays,
        updatedAt: s.updatedAt.toISOString()
      }}
    />
  )
}
