'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function FixedDonateTab() {
  const [hovered, setHovered] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const isHiddenRoute = pathname.startsWith('/admin') || pathname.startsWith('/super')

  if (isHiddenRoute) return null

  return (
    <>
      {/* ── Desktop: vertical edge tab ── */}
      <motion.div
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-100 hidden md:flex items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              className="mr-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-xl rounded-l-lg p-5 w-64"
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark mb-1.5">
                Support the Rescue
              </p>
              <p className="font-quicksand font-black text-base text-text-light dark:text-text-dark leading-snug mb-2">
                Every dollar helps a dog find home
              </p>
              <p className="text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed">
                Click to make a one-time or recurring donation.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <Link
          href="/donate"
          aria-label="Donate to Little Paws Dachshund Rescue"
          className="group flex flex-col items-center gap-2 bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark rounded-l-lg px-2.5 py-5 shadow-lg hover:pr-3 transition-all duration-200"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart className="w-3.5 h-3.5 shrink-0" aria-hidden="true" fill="currentColor" />
          </motion.div>
          <span
            className="text-[11px] font-mono font-black tracking-[0.25em] uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            Donate
          </span>
        </Link>
      </motion.div>

      {/* ── Mobile: floating circular button ── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        className="md:hidden fixed bottom-24 right-4 z-100"
      >
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-14 right-0 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-xl rounded-lg p-4 w-56"
            >
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark mb-1.5">
                Support the Rescue
              </p>
              <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug mb-2">
                Every dollar helps a dog find home
              </p>
              <Link
                href="/donate"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark"
              >
                Donate now →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close donate prompt' : 'Donate to Little Paws Dachshund Rescue'}
          className="relative w-12 h-12 rounded-full bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark shadow-lg flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </motion.div>
            ) : (
              <motion.div
                key="heart"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="w-5 h-5" aria-hidden="true" fill="currentColor" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>
    </>
  )
}
