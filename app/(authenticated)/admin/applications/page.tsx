import { auth } from 'lib/auth'
import { getApplications } from 'lib/actions/admin/application/getApplications'
import { ApplicationsClient } from './ApplicationsClient'

export default async function ApplicationsPage() {
  const [session, result] = await Promise.all([auth(), getApplications({ view: 'all' })])

  return (
    <ApplicationsClient
      applications={result.success ? result.data : []}
      error={result.success ? null : result.error}
      userId={session?.user?.id ?? null}
    />
  )
}
