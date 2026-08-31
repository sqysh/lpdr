'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Copy, Check, Truck, RefreshCw } from 'lucide-react'
import { HISTORICAL_TOTAL, sourceMeta } from 'lib/constants/dashboard.constants'
import { formatMoney } from 'app/utils/_currency.utils'
import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { rotateBypassCode } from 'lib/actions/admin/adoption-fee/rotateBypassCode'
import { useRouter } from 'next/navigation'
import { RevenueBySourceChart } from 'app/components/admin/dashboard/RevenueBySourceChart'
import { TopSupporters } from 'app/components/admin/dashboard/TopSupporters'
import { TopProducts } from 'app/components/admin/dashboard/TopProducts'

const fmtType = (type: string) =>
  sourceMeta[type]?.label ?? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')

export default function AdminDashboardClient({ stats }) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const session = useSession()
  const isSuperuser = session.data?.user?.role === 'SUPER_USER'
  const [rotating, setRotating] = useState(false)

  const handleRotate = async () => {
    setRotating(true)
    const result = await rotateBypassCode()
    setRotating(false)
    if (result.success) {
      router.refresh()
    }
  }

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

  const monthlyUp = data.monthlyChange >= 0
  const wieners = [...(data.welcomeWienerRevenue ?? [])].sort(
    (a, b) => b.totalRaised - a.totalRaised
  )
  const wienerTotal = wieners.reduce((s, w) => s + w.totalRaised, 0)
  const wienerMax = wieners[0]?.totalRaised ?? 0
  const sources = [...(data.ordersByType ?? [])].sort((a, b) => b.total - a.total)

  const copyCode = async () => {
    if (!data.bypassCode) return
    try {
      await navigator.clipboard.writeText(data.bypassCode)
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="w-full">
      {/* ── Header ── */}
      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="border-b border-border-light dark:border-border-dark px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4"
      >
        <div className="flex items-baseline gap-2">
          <h1 className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
            Dashboard
          </h1>
          <span className="font-mono text-[9px] tracking-widest text-muted-light dark:text-muted-dark">
            · Little Paws all time
          </span>
        </div>

        {data.bypassCode && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-[9px] tracking-widest uppercase text-muted-light dark:text-muted-dark hidden md:inline">
              Bypass
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.05em] text-primary-light dark:text-primary-dark">
              {data.bypassCode}
            </span>

            <button
              type="button"
              onClick={copyCode}
              aria-label={`Copy adoption fee bypass code ${data.bypassCode}`}
              className="text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
            >
              {copied ? (
                <Check className="w-3 h-3" aria-hidden="true" />
              ) : (
                <Copy className="w-3 h-3" aria-hidden="true" />
              )}
            </button>

            {isSuperuser && (
              <button
                type="button"
                onClick={handleRotate}
                disabled={rotating}
                aria-label="Rotate bypass code now"
                className="text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
              >
                <RefreshCw
                  className={`w-3 h-3 ${rotating ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </button>
            )}

            {data.bypassCodeRotatesAt && (
              <span className="font-mono text-[9px] text-muted-light/70 dark:text-muted-dark/70 hidden lg:inline ml-1">
                rotates{' '}
                {new Date(data.bypassCodeRotatesAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'America/New_York'
                })}
              </span>
            )}
          </div>
        )}
      </motion.header>

      {/* Pending shipments */}
      {data.pendingShipments.length > 0 && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark mb-5"
        >
          <div className="px-5 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500">
                Needs Shipping · {data.pendingShipments.length}{' '}
                {data.pendingShipments.length === 1 ? 'order' : 'orders'}
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {data.pendingShipments.map((shipment) => (
              <div key={shipment.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-text-light dark:text-text-dark truncate">
                    {shipment.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark truncate mt-0.5">
                    {shipment.items}
                  </p>
                  <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark truncate">
                    {shipment.address}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-xs font-bold text-text-light dark:text-text-dark tabular-nums mb-1">
                    {formatMoney(shipment.total)}
                  </p>
                  <Link
                    href={`/admin/orders/${shipment.id}`}
                    className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
                  >
                    Ship →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <div className="px-4 sm:px-6 py-6 pb-12 space-y-5">
        {/* ── Hero revenue row: total + monthly stat side by side ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5"
        >
          {/* Total revenue */}
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 sm:p-6">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2">
              Total revenue · all time
            </p>
            <div className="flex items-end justify-between gap-4">
              <p className="font-quicksand text-4xl sm:text-5xl font-black text-primary-light dark:text-primary-dark leading-none">
                {formatMoney(data.liveRevenue)}
              </p>
              <div className="text-right shrink-0 mb-1">
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark mb-0.5">
                  + historical
                </p>
                <p className="font-mono text-sm font-bold text-muted-light dark:text-muted-dark tabular-nums">
                  {formatMoney(HISTORICAL_TOTAL)}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-3">
              {monthlyUp ? (
                <TrendingUp
                  className="w-3.5 h-3.5 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
              ) : (
                <TrendingDown
                  className="w-3.5 h-3.5 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
              )}
              <span
                className={`font-mono text-[10px] tracking-[0.15em] uppercase ${monthlyUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {monthlyUp ? 'Up' : 'Down'} {Math.abs(data.monthlyChange)}% vs last month
              </span>
            </div>
          </div>

          {/* Quick stat pair: users + auctions, filling the vertical space next to revenue */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 flex flex-col justify-between">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Pack Members
              </p>
              <div>
                <p className="font-quicksand text-2xl font-black text-text-light dark:text-text-dark leading-none mb-1">
                  {data.totalUsers}
                </p>
                <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark">
                  +{data.newThisMonth} this month
                </p>
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 flex flex-col justify-between">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Active Auctions
              </p>
              <div>
                <p className="font-quicksand text-2xl font-black text-text-light dark:text-text-dark leading-none mb-1">
                  {data.activeAuctions}
                </p>
                <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark">
                  {formatMoney(data.auctionRevenue)} raised
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Revenue by source ── */}
        {sources.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2.5">
              Revenue by source
            </p>
            <section className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5">
              <RevenueBySourceChart sources={sources} fmtType={fmtType} />
            </section>
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
          <div className="flex items-center justify-between mb-1">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
              Welcome Wieners
            </p>
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
              {formatMoney(wienerTotal)} raised
            </span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark mb-4">
            Money raised per sponsored dog
          </p>

          {wieners.length === 0 ? (
            <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
              No data yet
            </p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {wieners.map((w) => {
                const pct = wienerMax ? Math.round((w.totalRaised / wienerMax) * 100) : 0
                return (
                  <div key={w.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs text-text-light dark:text-text-dark truncate">
                        {w.name}
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-muted-light dark:text-muted-dark tabular-nums shrink-0 ml-2">
                        {formatMoney(w.totalRaised)} &middot; {w.sponsorCount}{' '}
                        {w.sponsorCount === 1 ? 'sponsor' : 'sponsors'}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-bg-light dark:bg-bg-dark overflow-hidden">
                      <div
                        className="h-2 bg-primary-light dark:bg-primary-dark"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}
