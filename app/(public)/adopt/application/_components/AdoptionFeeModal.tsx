'use client'

import { motion, AnimatePresence } from 'framer-motion'

export function AdoptionFeeWelcomeModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-110"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-120 flex items-center justify-center px-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="adoption-welcome-title"
          >
            <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
              {/* Top accent */}
              <div className="h-1.5 w-full bg-primary-light dark:bg-primary-dark" />

              <div className="px-8 py-8 space-y-6">
                {/* Text */}
                <div className="space-y-2">
                  <h2
                    id="adoption-welcome-title"
                    className="text-xl font-bold text-neutral-900 dark:text-white"
                  >
                    Thank you for your payment!
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    You now have full access to the adoption application. Your access is valid for{' '}
                    <span className="font-semibold text-neutral-900 dark:text-white">7 days</span>{' '}
                    from today.
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    Need to come back later? Your application is always available in{' '}
                    <span className="font-semibold text-neutral-900 dark:text-white">My Pack</span>{' '}
                    — no need to pay again.
                  </p>
                </div>

                {/* Important: must finish in one sitting */}
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <svg
                    className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Once you start the application, keep this tab open until you finish. Stepping
                    away is fine, but refreshing the page or navigating away will clear everything
                    you have entered so far, and you will need to start over.
                  </p>
                </div>
                {/* Expiry note */}
                <div className="flex items-start gap-3 p-3 bg-primary-light/5 dark:bg-primary-dark/10 border border-primary-light/20 dark:border-primary-dark/20">
                  <svg
                    className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-xs text-primary-light dark:text-primary-dark">
                    Your access expires in 7 days. We recommend completing your application as soon
                    as possible.
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 bg-primary-light dark:bg-primary-dark hover:opacity-90 text-white text-sm font-semibold transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
                >
                  Sounds good →
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
