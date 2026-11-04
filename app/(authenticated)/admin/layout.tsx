import { ReactNode } from 'react'
import { AdminLayoutClient } from './AdminLayoutClient'
import { requireAdminPage } from 'lib/auth/guards'
import { getBypassCodeStatus } from 'lib/actions/admin/dashboard/queries/getBypassCodeStatus'
import { getAdminBadges } from 'lib/actions/admin/getAdminBadges'

export default async function AdminLayoutPage({ children }: { children: ReactNode }) {
  const { email, role } = await requireAdminPage()

  const [bypassCode, badges] = await Promise.all([getBypassCodeStatus(), getAdminBadges()])

  return (
    <AdminLayoutClient
      email={email}
      role={role}
      bypassCode={bypassCode.bypassCode}
      bypassCodeRotatesAt={bypassCode.bypassCodeRotatesAt}
      badges={badges}
    >
      {children}
    </AdminLayoutClient>
  )
}
