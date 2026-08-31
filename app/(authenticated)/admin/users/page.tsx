import AdminUsersClient from 'app/(authenticated)/admin/users/AdminUsersClient'
import { getPendingAdminInvites } from 'lib/actions/admin/user/getPendingAdminInvites'
import getUsers from 'lib/actions/admin/user/getUsers'

export default async function AdminUsersPage() {
  const [usersResult, pendingInvitesResult] = await Promise.all([
    getUsers(),
    getPendingAdminInvites()
  ])
  return <AdminUsersClient users={usersResult.data} pendingInvites={pendingInvitesResult.data} />
}
