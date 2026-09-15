'use client'

import { motion } from 'framer-motion'
import { IAuctionDetail, AuctionTab } from 'types/auction.types'
import { formatDate } from 'lib/utils/date.utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getAuctionStatusConfig } from 'lib/utils/auction.utils'
import { TABS } from 'lib/constants/auction.constants'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { OverviewTab } from './_components/OverviewTab'
import { ItemsTab } from './_components/ItemsTab'
import { SettingsTab } from './_components/SettingsTab'
import { BiddersTab } from './_components/BiddersTab'
import { WinningBiddersTab } from './_components/WinningBiddersTab'
import { TopBar } from './_components/TopBar'
import { Tabs } from './_components/Tabs'
import { Role } from '@prisma/client'
import { useStatusMessage } from '@hooks/useStatusMessage.hook'
import { toggleAuctionVisibility } from 'lib/actions/admin/auction/toggleAuctionVisibility'
import { StatusMessage } from 'components/_primitives/StatusMessage'
import { AuctionSignups } from 'lib/actions/admin/auction/getAuctionSignups'

const TAB_PANELS: Record<AuctionTab, React.ComponentType<{ auction: IAuctionDetail; role: Role; signups: AuctionSignups }>> = {
  Overview: OverviewTab,
  Items: ItemsTab,
  Settings: SettingsTab,
  Bidders: BiddersTab,
  'Winning Bidders': WinningBiddersTab
}

export default function AdminAuctionClient({ auction, role, signups }: { auction: IAuctionDetail; role: Role; signups: AuctionSignups }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Visibility is server state. The action writes it, router.refresh() re-runs the page, and the
  // new value arrives as a prop. Mirroring it locally only creates a second copy that can lie.
  const isVisible = auction.isPubliclyVisible

  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmingVisibility, setConfirmingVisibility] = useState(false)
  const [refreshing, startRefresh] = useTransition()

  const busy = saving || refreshing

  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const confirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { status, flash } = useStatusMessage()

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current)
      if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
    }
  }, [])

  const handleToggleVisibility = async () => {
    if (!confirmingVisibility) {
      setConfirmingVisibility(true)
      confirmTimeout.current = setTimeout(() => setConfirmingVisibility(false), 4000)
      return
    }

    if (confirmTimeout.current) clearTimeout(confirmTimeout.current)
    setConfirmingVisibility(false)
    setSaving(true)

    const result = await toggleAuctionVisibility(auction.id)

    setSaving(false)

    if (!result.success) {
      flash({ tone: 'error', message: 'Failed to update visibility', description: result.error ?? 'Please try again.' })
      return
    }

    // Held in a transition so the button keeps saying Saving until the new prop lands.
    startRefresh(() => router.refresh())
  }

  const statusConfig = getAuctionStatusConfig(auction.status)
  const visibleTabs = TABS.filter((t) => t.statuses.includes(auction.status))

  const tabSlug = (label: string) => label.toLowerCase().replace(/\s+/g, '-')
  const param = searchParams.get('tab')
  const activeTab: AuctionTab = visibleTabs.find((t) => tabSlug(t.label) === param)?.label ?? 'Overview'

  const selectTab = (label: AuctionTab) => {
    router.replace(`${pathname}?tab=${tabSlug(label)}`, { scroll: false })
  }

  const ActivePanel = TAB_PANELS[activeTab]

  const auctionUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auctions/${auction.customAuctionLink}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(auctionUrl)
    setCopied(true)
    flash({ tone: 'success', message: 'Link copied', description: 'Paste it into an email, a newsletter or a Facebook post.' })
    if (copyTimeout.current) clearTimeout(copyTimeout.current)
    copyTimeout.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      {/* ── Topbar ── */}
      <TopBar auction={auction} statusConfig={statusConfig} />

      {/* ── Title band ── */}
      <div className="w-full px-4 sm:px-6 pt-6 pb-4">
        {/* Title and link cluster share a row once there is width for it. The cluster is w-fit so
            the border wraps the controls instead of stretching to the far edge of a wide screen. */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black font-quicksand text-text-light dark:text-text-dark truncate">{auction.title}</h2>
            <p className="text-xs font-mono text-muted-light dark:text-muted-dark mt-1">
              {formatDate(auction.startDate)} to {formatDate(auction.endDate)}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2 w-fit max-w-full">
            {/* The public link and the two things you can do with it. */}
            <div className="flex items-center gap-px w-fit max-w-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
              <a
                href={auctionUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open the auction page in a new tab"
                className="flex items-baseline gap-1 px-3 py-2 min-w-0 hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <span className="text-f10 font-mono text-muted-light dark:text-muted-dark shrink-0 hidden sm:inline">
                  littlepawsdr.org/auctions/
                </span>
                <span className="text-f10 font-mono font-bold text-text-light dark:text-text-dark truncate">
                  {auction.customAuctionLink}
                </span>
              </a>

              <button
                type="button"
                onClick={handleCopy}
                title="Copy the link so you can paste it into an email or a post"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-l border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 text-f10 font-mono tracking-eyebrow uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {copied ? (
                  <>
                    <Check size={11} className="text-emerald-500" aria-hidden="true" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={11} aria-hidden="true" />
                    Copy link
                  </>
                )}
              </button>

              <a
                href={auctionUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open the auction page in a new tab, the way supporters see it"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-l border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 text-f10 font-mono tracking-eyebrow uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <ExternalLink size={11} aria-hidden="true" />
                View page
              </a>
            </div>

            {/* Published state is a fact about the auction, not a third thing you can do to the
                link, so it reads as a sentence with the action beside it rather than a fourth
                button in the row above. */}
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 shrink-0 ${isVisible ? 'bg-emerald-500' : 'bg-muted-light dark:bg-muted-dark'}`}
                aria-hidden="true"
              />
              <span className="text-f10 font-mono text-muted-light dark:text-muted-dark">
                {isVisible ? 'Visible to supporters' : 'Hidden from supporters'}
              </span>
              <button
                type="button"
                onClick={handleToggleVisibility}
                disabled={busy}
                title={isVisible ? 'Hide this auction so supporters cannot see it' : 'Show this auction to supporters'}
                className={`text-f9 font-mono tracking-tag uppercase underline underline-offset-4 decoration-dotted transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline ${
                  confirmingVisibility
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark'
                }`}
              >
                {busy ? 'Saving' : confirmingVisibility ? (isVisible ? 'Yes, hide it' : 'Yes, show it') : isVisible ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        {/* empty:hidden so a null status contributes no margin */}
        <div className="mt-4 empty:hidden">
          <StatusMessage status={status} />
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 pb-6">
        {/* ── Tabs ── */}
        <Tabs activeTab={activeTab} selectTab={selectTab} visibleTabs={visibleTabs} />

        {/* ── Panels ── */}
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            {ActivePanel && <ActivePanel auction={auction} role={role} signups={signups} />}
          </motion.div>
        </div>
      </div>
    </main>
  )
}
