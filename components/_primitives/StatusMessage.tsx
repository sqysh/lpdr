import { motion, AnimatePresence } from 'framer-motion'

type Tone = 'success' | 'error'

const toneStyles: Record<Tone, string> = {
  success:
    'border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/5 dark:bg-primary-dark/5',
  error: 'border-red-500/30 dark:border-red-400/30 bg-red-500/5 dark:bg-red-400/5'
}

export type Status = {
  tone: Tone
  message: string
  description?: string
}

export function StatusMessage({ status }: { status: Status | null }) {
  return (
    <AnimatePresence>
      {status && (
        <motion.div
          key={status.message}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role={status.tone === 'error' ? 'alert' : 'status'}
          aria-live={status.tone === 'error' ? 'assertive' : 'polite'}
          className={`px-4 py-3 border ${toneStyles[status.tone]}`}
        >
          <p className="text-xs font-mono font-medium text-text-light dark:text-text-dark">
            {status.message}
          </p>
          {status.description && (
            <p className="mt-0.5 text-[10px] font-mono text-muted-light dark:text-muted-dark">
              {status.description}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
