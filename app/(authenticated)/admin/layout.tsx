import { ReactNode } from 'react'
import { AdminLayoutClient } from './AdminLayoutClient'
import { auth } from 'lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLayoutPage({ children }: { children: ReactNode }) {
  // Runs on the Node runtime — the database session lookup works here.
  const session = await auth()
  const role = session?.user?.role
  const email = session?.user?.email

  if (!session?.user) {
    redirect('/auth/login')
  }

  if (role !== 'ADMIN' && role !== 'SUPER_USER') {
    redirect(' /my-pack')
  }
  return (
    <AdminLayoutClient email={email} role={role}>
      {children}
    </AdminLayoutClient>
  )
}
