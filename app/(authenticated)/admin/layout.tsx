import { ReactNode } from 'react'
import { AdminLayoutClient } from './AdminLayoutClient'
import { requireAdminPage } from 'lib/auth/guards'

export default async function AdminLayoutPage({ children }: { children: ReactNode }) {
  const { email, role } = await requireAdminPage()

  return (
    <AdminLayoutClient email={email} role={role}>
      {children}
    </AdminLayoutClient>
  )
}
