import { formatDate } from 'app/utils/_date.utils'
import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export function CancelSubscriptionModal({
  onConfirm,
  onClose,
  loading,
  cancelAtPeriodEnd,
  nextBillingDate
}: {
  onConfirm: () => void
  onClose: () => void
  loading: boolean
  cancelAtPeriodEnd: boolean
  nextBillingDate: Date | null
}) {
  return (
    <>
      <motion.div
        key="cancel-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        key="cancel-modal"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-x-4 bottom-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm z-50 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border-light dark:border-border-dark">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle
                className="w-3.5 h-3.5 text-red-500 dark:text-red-400"
                aria-hidden="true"
              />
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-red-500 dark:text-red-400">
                Cancel Subscription
              </p>
            </div>
            <h2
              id="cancel-modal-title"
              className="font-quicksand font-bold text-lg text-text-light dark:text-text-dark"
            >
              Are you sure?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark p-1"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed mb-6">
            {cancelAtPeriodEnd
              ? 'Your subscription is already set to cancel.'
              : nextBillingDate
                ? `Your subscription will remain active until ${formatDate(nextBillingDate)} and will not renew after that.`
                : 'Your subscription will be cancelled and will not renew.'}
          </p>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`w-full py-3.5 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500
                ${
                  loading
                    ? 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border border-border-light dark:border-border-dark cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full"
                    aria-hidden="true"
                  />
                  Cancelling...
                </span>
              ) : (
                'Yes, cancel subscription'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 text-[10px] font-mono tracking-[0.2em] uppercase border-2 border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Keep subscription
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
