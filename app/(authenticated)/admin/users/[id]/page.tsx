import { notFound } from 'next/navigation'
import AdminUserDetailsClient from './AdminUserDetailsClient'
import { getUserById } from 'lib/actions/admin/user/getUserById'
import { checkMigrationStatus } from 'lib/actions/admin/user/checkMigrationStatus'
import { auth } from 'lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminUserDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [userResult, session] = await Promise.all([getUserById(id), auth()])

  if (!userResult.success || !userResult.data) {
    notFound()
  }

  const migrationResult = userResult.data.email
    ? await checkMigrationStatus(userResult.data.email)
    : null

  return (
    <AdminUserDetailsClient
      user={userResult.data}
      migrationStatus={migrationResult?.success ? migrationResult.data : null}
      loggedInUser={session.user}
    />
  )
}
