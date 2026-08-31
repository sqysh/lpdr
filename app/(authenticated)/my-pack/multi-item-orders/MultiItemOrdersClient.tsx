'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { fadeUp } from 'lib/constants/motion.constants'
import { MultiItemOrder } from 'types/_my-pack.types'
import { PurchaseRow } from 'app/components/my-pack/PurchaseRow'

export default function MultiItemOrdersClient({ orders }: { orders: MultiItemOrder[] }) {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Multi Item Orders
            </p>
          </div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark leading-tight">
              My <span className="font-light text-muted-light dark:text-muted-dark">Purchases</span>
            </h1>
            <Link
              href=" /my-pack"
              className="shrink-0 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline mt-2"
            >
              ← My Pack
            </Link>
          </div>
          <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark mt-3">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* ── List ── */}
        {orders.length === 0 ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-mono text-muted-light dark:text-muted-dark">
              You haven&apos;t made any orders yet.
            </p>
            <Link
              href="/merch"
              className="inline-block mt-4 text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:underline"
            >
              Browse the store →
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="border border-border-light dark:border-border-dark"
            role="list"
            aria-label="Purchase history"
          >
            {orders.map((order, i) => (
              <div key={order.id} role="listitem">
                <PurchaseRow order={order} index={i} />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  )
}
