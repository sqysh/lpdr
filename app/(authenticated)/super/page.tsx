import SuperDashboardClient from 'app/(authenticated)/super/SuperDashboardClient'
import { getAdminUsers } from 'lib/actions/super-user/getAdminUsers'
import { getAuditLogs } from 'lib/actions/super-user/getAuditLogs'
import { getCronJobs } from 'lib/actions/super-user/getCronJobs'
import { getManagedUsers } from 'lib/actions/super-user/getManagedUsers'
import { getPulseStats } from 'lib/actions/super-user/getPulseStats'
import { getServiceHealth } from 'lib/actions/super-user/getServiceHealth'

export default async function SuperDashboardPage() {
  const [services, cronJobs, pulseStats, adminUsers, auditLogs, managedUsers] = await Promise.all([
    getServiceHealth(),
    getCronJobs(),
    getPulseStats(),
    getAdminUsers(),
    getAuditLogs(),
    getManagedUsers()
  ])

  return (
    <SuperDashboardClient
      services={services}
      cronJobs={cronJobs}
      pulseStats={pulseStats}
      adminUsers={adminUsers}
      auditLogs={auditLogs.data}
      managedUsers={managedUsers}
    />
  )
}
