'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { useModalsStore } from 'stores/modals.store'

const DISMISS_AFTER = 7000

const actionLink =
  'flex-1 py-2 text-center text-[10px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

export function CartToast() {
  const item = useModalsStore((s) => s.cartToastItem)
  const onClose = useModalsStore((s) => s.hideCartToast)

  useEffect(() => {
    if (!item) return

    const timeout = setTimeout(onClose, DISMISS_AFTER)
    return () => clearTimeout(timeout)
  }, [item, onClose])

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={item.id ?? item.welcomeWienerId ?? item.feedAFosterId ?? item.name}
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-200"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="bg-surface-light dark:bg-surface-dark border border-primary-light/20 dark:border-primary-dark/20 shadow-lg">
            {/* Progress drain bar */}
            <motion.div
              className="h-px bg-primary-light dark:bg-primary-dark"
              initial={{ scaleX: 1, originX: 0 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: DISMISS_AFTER / 1000, ease: 'linear' }}
              aria-hidden="true"
            />

            <div className="flex items-start gap-3 px-4 py-3.5">
              {/* Check icon */}
              <div
                className="shrink-0 w-6 h-6 flex items-center justify-center bg-primary-light dark:bg-primary-dark mt-0.5"
                aria-hidden="true"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark mb-0.5">
                  Added to cart
                </p>
                <p className="text-sm font-mono text-text-light dark:text-text-dark truncate">
                  {item.name}
                </p>
                <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark mt-0.5 tabular-nums">
                  ${item.price}
                </p>
              </div>

              {/* Dismiss */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss notification"
                className="shrink-0 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark p-0.5"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2 px-4 pb-3.5">
              <Link
                href="/cart"
                onClick={onClose}
                className={`${actionLink} border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-text-light dark:hover:text-text-dark`}
              >
                Cart
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className={`${actionLink} bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white duration-200`}
              >
                Checkout
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
