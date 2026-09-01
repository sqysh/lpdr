'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Trophy, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { formatMoney } from 'app/utils/_currency.utils'
import { AuctionEndedData } from 'types/_auction'

type Props = {
  data: AuctionEndedData | null
  onClose: () => void
}

export function AuctionEndedModal({ data, onClose }: Props) {
  return (
    <AnimatePresence>
      {data && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-110 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auction-ended-heading"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-120 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark pointer-events-auto overflow-hidden">
              {/* Animated top bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ transformOrigin: 'left' }}
                className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-primary-light via-secondary-dark to-primary-dark dark:from-primary-dark dark:via-secondary-dark dark:to-primary-light"
                aria-hidden="true"
              />

              {/* Shimmer */}
              <motion.div
                className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-white/60 to-transparent pointer-events-none"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeInOut' }}
                aria-hidden="true"
              />

              {/* Corner ornaments */}
              {[
                'top-0 left-0 border-t-2 border-l-2',
                'top-0 right-0 border-t-2 border-r-2',
                'bottom-0 left-0 border-b-2 border-l-2',
                'bottom-0 right-0 border-b-2 border-r-2'
              ].map((pos, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                  className={`absolute w-4 h-4 border-primary-light dark:border-primary-dark pointer-events-none ${pos}`}
                  aria-hidden="true"
                />
              ))}

              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 p-1.5 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark border border-transparent hover:border-border-light dark:hover:border-border-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <X size={14} aria-hidden="true" />
              </button>

              {/* Header */}
              <div className="px-8 pt-12 pb-6 text-center border-b border-border-light dark:border-border-dark">
                {/* Icon with pulse rings */}
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="w-16 h-16 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-center">
                    <Trophy size={24} className="text-primary-light dark:text-primary-dark" aria-hidden="true" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 500, damping: 18 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary-light dark:bg-primary-dark flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <Gavel size={12} className="text-white dark:text-bg-dark" />
                  </motion.div>
                </div>

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-3 mb-4"
                >
                  <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500" aria-hidden="true" />
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                      Auction Closed
                    </p>
                  </div>
                  <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
                </motion.div>

                <motion.h2
                  id="auction-ended-heading"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="font-quicksand font-black text-xl text-text-light dark:text-text-dark leading-snug mb-2"
                >
                  {data.auctionTitle}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xs font-mono text-muted-light dark:text-muted-dark"
                >
                  Thank you to everyone who participated and supported the dogs in our care.
                </motion.p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-px bg-border-light dark:bg-border-dark border-b border-border-light dark:border-border-dark">
                {[
                  { label: 'Raised', value: formatMoney(data.totalRaised), accent: true },
                  { label: 'Items', value: String(data.itemCount), accent: false },
                  { label: 'Bidders', value: String(data.bidderCount), accent: false }
                ].map(({ label, value, accent }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="bg-bg-light dark:bg-bg-dark px-4 py-4 text-center"
                  >
                    <p
                      className={`text-lg font-black font-mono leading-none mb-1 ${accent ? 'text-primary-light dark:text-primary-dark' : 'text-text-light dark:text-text-dark'}`}
                    >
                      {value}
                    </p>
                    <p className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
                      {label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="px-8 py-6 flex flex-col gap-3"
              >
                <Link
                  onClick={onClose}
                  href={`/auctions/${data.customAuctionLink}`}
                  className="group relative overflow-hidden flex items-center justify-between px-5 py-4 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  <motion.span
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
                    animate={{ x: ['-150%', '250%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] font-mono tracking-[0.2em] uppercase font-black">View Results</span>
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </Link>
                <button
                  onClick={onClose}
                  className="px-5 py-3 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark border border-border-light dark:border-border-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  Dismiss
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
