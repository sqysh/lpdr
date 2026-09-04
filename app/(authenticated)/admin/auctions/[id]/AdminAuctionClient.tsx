'use client'

import { motion } from 'framer-motion'
import { IAuction, Tab } from 'types/auction.types'
import { formatDate } from 'lib/utils/date.utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getAuctionStatusConfig } from 'lib/utils/auction.utils'
import { TABS } from 'lib/constants/auction.constants'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { OverviewTab } from './_components/OverviewTab'
import { ItemsTab } from './_components/ItemsTab'
import { SettingsTab } from './_components/SettingsTab'
import { BiddersTab } from './_components/BiddersTab'
import { WinningBiddersTab } from './_components/WinningBiddersTab'
import { TopBar } from './_components/TopBar'
import { Tabs } from './_components/Tabs'
import { Role } from '@prisma/client'
import { useSession } from 'next-auth/react'

const TAB_PANELS: Record<string, React.ComponentType<{ auction: IAuction; role: Role }>> = {
  Overview: OverviewTab,
  Items: ItemsTab,
  Settings: SettingsTab,
  Bidders: BiddersTab,
  'Winning Bidders': WinningBiddersTab
}

export default function AdminAuctionClient({ auction }: { auction: IAuction }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const session = useSession()
  const role: Role = session.data?.user?.role

  const statusConfig = getAuctionStatusConfig(auction.status)
  const visibleTabs = TABS.filter((t) => t.statuses.includes(auction.status))

  const tabSlug = (label: string) => label.toLowerCase().replace(/\s+/g, '-')
  const param = searchParams.get('tab')
  const activeTab: Tab = visibleTabs.find((t) => tabSlug(t.label) === param)?.label ?? 'Overview'

  const selectTab = (label: Tab) => {
    router.replace(`${pathname}?tab=${tabSlug(label)}`, { scroll: false })
  }

  const ActivePanel = TAB_PANELS[activeTab]

  const auctionUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auctions/${auction.customAuctionLink}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(auctionUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      {/* ── Topbar ── */}
      <TopBar auction={auction} statusConfig={statusConfig} />

      {/* ── Title band ── */}
      <div className="w-full px-4 sm:px-6 pt-6 pb-4 space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-quicksand text-text-light dark:text-text-dark">{auction.title}</h2>
          <p className="text-xs font-mono text-muted-light dark:text-muted-dark mt-1">
            {formatDate(auction.startDate)} — {formatDate(auction.endDate)}
          </p>
        </div>

        {auction.customAuctionLink && (
          <div className="flex items-center gap-px border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-0">
              <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark shrink-0">
                littlepawsdr.org/auctions/
              </span>
              <span className="text-[10px] font-mono font-bold text-text-light dark:text-text-dark truncate">
                {auction.customAuctionLink}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Link copied' : 'Copy auction link'}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-l border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              {copied ? (
                <>
                  <Check size={11} className="text-emerald-500" aria-hidden="true" />
                  <span className="text-emerald-500">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={11} aria-hidden="true" />
                  Copy
                </>
              )}
            </button>

            <a
              href={auctionUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View public auction page"
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-l border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <ExternalLink size={11} aria-hidden="true" />
              View
            </a>
          </div>
        )}
      </div>

      <div className="w-full px-4 sm:px-6 pb-6">
        {/* ── Tabs ── */}
        <Tabs activeTab={activeTab} selectTab={selectTab} visibleTabs={visibleTabs} />

        {/* ── Panels ── */}
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            {ActivePanel && <ActivePanel auction={auction} role={role} />}
          </motion.div>
        </div>
      </div>
    </main>
  )
}
