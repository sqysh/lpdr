'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Radio, CheckCircle, Gavel } from 'lucide-react'
import { store } from 'lib/store/store'
import { setOpenAuctionDrawer } from 'lib/store/slices/uiSlice'
import AdminPageHeader from 'app/components/admin/_shared/AdminPageHeader'
import AdminHeaderButton from 'app/components/admin/_shared/AdminHeaderButton'
import { Stat } from 'app/components/admin/_shared/Stat'
import AdminEmptyState from 'app/components/admin/_shared/AdminEmptyState'
import AdminFilterTabs from 'app/components/admin/_shared/AdminFilterTabs'
import { AUCTION_FILTERS } from 'lib/constants/auction.constants'
import { IAuction } from 'types/_auction'
import { AdminAuctionCard } from 'app/components/admin/auctions'

// ── Grouping helpers ───────────────────────────────────────────────────────

function getQuarter(date: string | Date) {
  const d = new Date(date)
  return Math.floor(d.getMonth() / 3) + 1
}

function getYear(date: string | Date) {
  return new Date(date).getFullYear()
}

type YearGroup = {
  year: number
  quarters: QuarterGroup[]
}

type QuarterGroup = {
  quarter: number
  auctions: IAuction[]
}

function groupByYearAndQuarter(auctions: IAuction[]): YearGroup[] {
  const map = new Map<number, Map<number, IAuction[]>>()

  for (const auction of auctions) {
    const year = getYear(auction.startDate)
    const quarter = getQuarter(auction.startDate)

    if (!map.has(year)) map.set(year, new Map())
    const yearMap = map.get(year)!
    if (!yearMap.has(quarter)) yearMap.set(quarter, [])
    yearMap.get(quarter)!.push(auction)
  }

  return [...map.entries()]
    .sort(([a], [b]) => b - a) // newest year first
    .map(([year, quarterMap]) => ({
      year,
      quarters: [...quarterMap.entries()]
        .sort(([a], [b]) => b - a) // newest quarter first
        .map(([quarter, auctions]) => ({ quarter, auctions }))
    }))
}

// ── Main client ────────────────────────────────────────────────────────────

export default function AdminAuctionsClient({ auctions }: { auctions: IAuction[] }) {
  const [filter, setFilter] = useState('ALL')

  const filtered = filter === 'ALL' ? auctions : auctions.filter((a) => a.status === filter)
  const grouped = groupByYearAndQuarter(filtered)

  const counts = {
    ALL: auctions.length,
    DRAFT: auctions.filter((a) => a.status === 'DRAFT').length,
    ACTIVE: auctions.filter((a) => a.status === 'ACTIVE').length,
    ENDED: auctions.filter((a) => a.status === 'ENDED').length
  }

  let cardIndex = 0

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader
        title="Auctions"
        count={{ value: auctions.length, noun: 'auction' }}
        action={
          <AdminHeaderButton
            onClick={() => store.dispatch(setOpenAuctionDrawer())}
            icon={<Plus size={12} aria-hidden="true" />}
          >
            New Auction
          </AdminHeaderButton>
        }
      />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Total" value={String(counts.ALL)} icon={Gavel} />
          <Stat label="Draft" value={String(counts.DRAFT)} icon={FileText} />
          <Stat label="Active" value={String(counts.ACTIVE)} icon={Radio} accent />
          <Stat label="Ended" value={String(counts.ENDED)} icon={CheckCircle} />
        </div>

        {/* Filter tabs */}
        <AdminFilterTabs
          options={AUCTION_FILTERS}
          value={filter}
          onChange={setFilter}
          counts={counts}
          label="Filter auctions by status"
        />

        {/* Grouped list */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-8"
            >
              {grouped.map(({ year, quarters }) => (
                <div key={year}>
                  {/* Year heading */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                      {year}
                    </span>
                    <span className="flex-1 h-px bg-border-light dark:bg-border-dark" />
                  </div>

                  <div className="space-y-6">
                    {quarters.map(({ quarter, auctions }) => (
                      <div key={quarter}>
                        {/* Quarter heading */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light/60 dark:text-muted-dark/60">
                            Q{quarter}
                          </span>
                          <span className="flex-1 h-px bg-border-light/50 dark:bg-border-dark/50" />
                          <span className="text-[9px] font-mono text-muted-light/60 dark:text-muted-dark/60">
                            {auctions.length} auction{auctions.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Full-width cards */}
                        <div className="space-y-3">
                          {auctions.map((auction) => (
                            <AdminAuctionCard
                              key={auction.id}
                              auction={auction}
                              index={cardIndex++}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminEmptyState
                icon={<Gavel size={20} aria-hidden="true" />}
                title="No auctions yet"
                description="Create your first auction to get started"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
