'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Radio, CheckCircle, Gavel } from 'lucide-react'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import AdminHeaderButton from 'app/(authenticated)/admin/_components/AdminHeaderButton'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import AdminEmptyState from 'app/(authenticated)/admin/_components/AdminEmptyState'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import { AUCTION_FILTERS } from 'lib/constants/auction.constants'
import { IAuction } from 'types/auction.types'
import { AdminAuctionCard } from './_components/AdminAuctionCard'
import { groupByYearAndQuarter } from './_lib/groupByYearAndQuarter'
import { CreateAuctionModal } from './_components/CreateAuctionModal'

export default function AdminAuctionsClient({ auctions }: { auctions: IAuction[] }) {
  const [filter, setFilter] = useState('ALL')
  const [openAuctionModal, setOpenAuctionModal] = useState(false)

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
    <>
      <CreateAuctionModal isOpen={openAuctionModal} onClose={() => setOpenAuctionModal(false)} />

      <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
        <AdminPageHeader
          title="Auctions"
          count={{ value: auctions.length, noun: 'auction' }}
          action={
            <AdminHeaderButton onClick={() => setOpenAuctionModal(true)} icon={<Plus size={12} aria-hidden="true" />}>
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
                              <AdminAuctionCard key={auction.id} auction={auction} index={cardIndex++} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
    </>
  )
}
