'use client'

import { CronJob } from 'lib/actions/super-user/getCronJobs'
import { PulseStat } from 'lib/actions/super-user/getPulseStats'
import { AdminUser } from 'lib/actions/super-user/getAdminUsers'
import { LiveActionsFeed } from './_components/LiveActionsFeed'
import { ServiceStrip } from './_components/ServiceHealthStrip'
import { CronStrip } from './_components/CronStrip'
import { PulseColumn } from './_components/PulseColumn'
import { RightColumn } from './_components/RightColumn'
import { ManagedUser } from 'lib/actions/super-user/getManagedUsers'
import { ServiceHealth } from 'lib/actions/super-user/getServiceHealth'
import { LogEntry } from 'lib/actions/super-user/getAuditLogs'
import { AnomalyStrip } from './_components/AnomalyStrip'
import { AuctionAnomaly } from 'lib/actions/super-user/getAuctionAnomalies'
import { SuperTopBar } from './_components/SuperTopBar'

export default function SuperDashboardClient({
  services,
  cronJobs,
  pulseStats,
  adminUsers,
  auditLogs,
  managedUsers,
  anomalies
}: {
  services: ServiceHealth[]
  cronJobs: CronJob[]
  pulseStats: PulseStat[]
  adminUsers: AdminUser[]
  auditLogs: LogEntry[]
  managedUsers: ManagedUser[]
  anomalies: AuctionAnomaly[]
}) {
  return (
    <div className="h-dvh flex flex-col bg-bg-light dark:bg-bg-dark overflow-hidden">
      <SuperTopBar anomalies={anomalies} pulseStats={pulseStats} />
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <PulseColumn stats={pulseStats} />
          <LiveActionsFeed />
          <RightColumn adminUsers={adminUsers} managedUsers={managedUsers} auditLogs={auditLogs} />
        </div>
        <AnomalyStrip anomalies={anomalies} />
        <ServiceStrip services={services} />
        <CronStrip initialJobs={cronJobs} />
      </main>
    </div>
  )
}
