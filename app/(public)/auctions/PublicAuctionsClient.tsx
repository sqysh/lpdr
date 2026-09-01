'use client'

import { motion, useInView } from 'framer-motion'
import { Users, Package, Zap } from 'lucide-react'
import { useRef } from 'react'
import { formatMoney } from 'app/utils/_currency.utils'
import { EmptyState } from 'app/(public)/auctions/_components/EmptyState'
import { PastAuctionCard } from 'app/(public)/auctions/_components/PastAuctionCard'
import { ActiveAuctionCard } from './_components/ActiveAuctionCard'

export default function PublicAuctionsClient({ auctions }) {
  const active = auctions.filter((a) => a.status === 'ACTIVE')
  const past = auctions.filter((a) => a.status === 'ENDED')

  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })

  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* ── Header ── */}
        <header ref={headerRef} className="mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 mb-4"
          >
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Little Paws Dachshund Rescue
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-quicksand font-black text-4xl sm:text-5xl lg:text-6xl text-text-light dark:text-text-dark leading-[1.05] mb-4"
          >
            Rescue
            <br className="sm:hidden" /> Auctions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="text-base sm:text-lg font-mono text-muted-light dark:text-muted-dark max-w-xl leading-relaxed"
          >
            Bid on incredible items and experiences — every dollar goes directly to rescuing and
            rehabilitating dachshunds in need.
          </motion.p>

          {/* Impact strip */}
          {auctions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="flex flex-wrap items-center gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark mt-8 w-fit"
            >
              {[
                {
                  icon: Zap,
                  label: 'Total Raised',
                  value: formatMoney(auctions.reduce((s, a) => s + a.totalAuctionRevenue, 0))
                },
                {
                  icon: Package,
                  label: 'Items Auctioned',
                  value: String(auctions.reduce((s, a) => s + a.items.length, 0))
                },
                {
                  icon: Users,
                  label: 'Bidders',
                  value: String(auctions.reduce((s, a) => s + a.bidders.length, 0))
                }
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="bg-bg-light dark:bg-bg-dark px-5 py-3.5 flex items-center gap-3"
                >
                  <Icon
                    size={13}
                    className="text-primary-light dark:text-primary-dark"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-black font-mono text-text-light dark:text-text-dark leading-none">
                      {value}
                    </p>
                    <p className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark mt-0.5">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </header>

        {/* ── Active auctions ── */}
        {active.length > 0 && (
          <section aria-labelledby="active-heading" className="mb-16 sm:mb-24">
            <div className="flex items-center gap-3 mb-6">
              <span
                className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                aria-hidden="true"
              />
              <h2
                id="active-heading"
                className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
              >
                Live Now
              </h2>
              <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />
            </div>
            <div className="space-y-6">
              {active.map((auction, i) => (
                <ActiveAuctionCard key={auction.id} auction={auction} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* ── No auctions at all ── */}
        {auctions.length === 0 && <EmptyState />}

        {/* ── Past auctions ── */}
        {past.length > 0 && (
          <section aria-labelledby="past-heading">
            <div className="flex items-center gap-3 mb-6">
              <span
                className="block w-6 h-px bg-border-light dark:bg-border-dark shrink-0"
                aria-hidden="true"
              />
              <h2
                id="past-heading"
                className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
              >
                Past Auctions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
              {past.map((auction, i) => (
                <div key={auction.id} className="bg-bg-light dark:bg-bg-dark">
                  <PastAuctionCard auction={auction} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
