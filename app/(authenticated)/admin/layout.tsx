import { ReactNode } from 'react'
import { AdminLayoutClient } from './AdminLayoutClient'
import { requireAdminPage } from 'lib/auth/guards'
import { getBypassCodeStatus } from 'lib/actions/admin/dashboard/queries/getBypassCodeStatus'

export default async function AdminLayoutPage({ children }: { children: ReactNode }) {
  const { email, role } = await requireAdminPage()
  const bypassCode = await getBypassCodeStatus()

  return (
    <AdminLayoutClient
      email={email}
      role={role}
      bypassCode={bypassCode.bypassCode}
      bypassCodeRotatesAt={bypassCode.bypassCodeRotatesAt}
    >
      {children}
    </AdminLayoutClient>
  )
}
