'use client'

import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import {
  AdminDashboardHeader,
  AdminDashboardWelcomeWienerSection,
  PendingShipments,
  RevenueBySourceChart,
  TopProducts,
  TopSupporters
} from './_components'
import { AdminDashboardHero } from './_components/AdminDashboardHero'

export default function AdminDashboardClient({ stats }) {
  if (!stats.success || !stats.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-mono text-xs text-muted-light dark:text-muted-dark">
          {stats.error ?? 'Unable to load dashboard data'}
        </p>
      </div>
    )
  }

  const data = stats.data

  const sources = [...(data.ordersByType ?? [])].sort((a, b) => b.total - a.total)

  return (
    <div className="w-full">
      {/* ── Header ── */}
      <AdminDashboardHeader data={data} />

      {/* —— Pending shipments —— */}
      {data.pendingShipments.length > 0 && <PendingShipments data={data} />}

      <div className="px-4 sm:px-6 py-6 pb-12 space-y-5">
        {/* ── Hero  ── */}
        <AdminDashboardHero data={data} />

        {/* ── Revenue by source ── */}
        {sources.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <RevenueBySourceChart sources={sources} />
          </motion.div>
        )}

        {/* ── Top Supporters + Top Products side by side ── */}
        {(data.topSupporters?.length > 0 || data.topProducts?.length > 0) && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          >
            {data.topSupporters?.length > 0 && <TopSupporters supporters={data.topSupporters} />}
            {data.topProducts?.length > 0 && <TopProducts products={data.topProducts} />}
          </motion.div>
        )}

        {/* ── Welcome Wieners ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 sm:p-6"
        >
          <AdminDashboardWelcomeWienerSection data={data} />
        </motion.section>
      </div>
    </div>
  )
}
