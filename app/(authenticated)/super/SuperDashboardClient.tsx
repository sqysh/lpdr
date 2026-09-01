'use client'

import { useState } from 'react'
import { RefreshCw, LogOut, LayoutDashboard, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
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

interface Props {
  services: ServiceHealth[]
  cronJobs: CronJob[]
  pulseStats: PulseStat[]
  adminUsers: AdminUser[]
  auditLogs: LogEntry[]
  managedUsers: ManagedUser[]
}

export default function SuperDashboardClient({
  services,
  cronJobs,
  pulseStats,
  adminUsers,
  auditLogs,
  managedUsers
}: Props) {
  const [refreshing, setRefreshing] = useState(false)

  const hasIssues = pulseStats?.some((s) => s.signal === 'red')
  const hasWarnings = !hasIssues && pulseStats?.some((s) => s.signal === 'yellow')

  return (
    <div className="h-dvh flex flex-col bg-bg-light dark:bg-bg-dark overflow-hidden">
      {/* Topbar */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark shrink-0 flex-wrap gap-2 z-50">
        <div className="flex items-center gap-2">
          <div>
            <span className="font-quicksand font-bold text-[12px] text-text-light dark:text-text-dark leading-tight">
              Little Paws
            </span>
            <p className="font-mono text-[8px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
              System Control Panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2 py-1 border font-mono text-[8px] tracking-[0.12em] uppercase ${
              hasIssues
                ? 'border-red-500/30 text-red-500'
                : hasWarnings
                  ? 'border-amber-500/30 text-amber-500'
                  : 'border-green-500/30 text-green-500'
            }`}
          >
            <span
              className={`w-1 h-1 animate-pulse ${hasIssues ? 'bg-red-500' : hasWarnings ? 'bg-amber-500' : 'bg-green-500'}`}
            />
            {hasIssues ? 'Issues' : hasWarnings ? 'Warnings' : 'All Systems Go'}
          </div>
          <button
            type="button"
            onClick={() => {
              setRefreshing(true)
              setTimeout(() => setRefreshing(false), 1200)
            }}
            className="inline-flex items-center gap-1 px-2 py-1 font-mono text-[8px] tracking-[0.12em] uppercase border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <RefreshCw size={9} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1 px-2 py-1 font-mono text-[8px] tracking-[0.12em] uppercase border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <LayoutDashboard size={9} aria-hidden="true" />
            Admin
          </Link>
          <Link
            href="/super/logs"
            className="inline-flex items-center gap-1 px-2 py-1 font-mono text-[8px] tracking-[0.12em] uppercase border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <ScrollText size={9} aria-hidden="true" />
            Logs
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="inline-flex items-center gap-1 px-2 py-1 font-mono text-[8px] tracking-[0.12em] uppercase border border-red-500/40 text-red-500 hover:bg-red-500/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut size={9} aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <PulseColumn stats={pulseStats} />
          <LiveActionsFeed />
          <RightColumn adminUsers={adminUsers} managedUsers={managedUsers} auditLogs={auditLogs} />
        </div>
        <ServiceStrip services={services} />
        <CronStrip initialJobs={cronJobs} />
      </main>
    </div>
  )
}
