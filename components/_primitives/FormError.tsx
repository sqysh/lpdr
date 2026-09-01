import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  error: string | null
}

export function FormError({ error }: Props) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          key="error"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role="alert"
          aria-live="assertive"
          className="text-xs text-red-500 dark:text-red-400 font-mono flex items-start gap-2"
        >
          <span aria-hidden="true" className="shrink-0 mt-0.5">
            ✕
          </span>
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
