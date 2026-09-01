import { motion } from 'framer-motion'
import { Gavel } from 'lucide-react'

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border-light dark:border-border-dark py-24 flex flex-col items-center justify-center gap-6 text-center px-6"
    >
      <div className="relative">
        <div className="w-16 h-16 border border-border-light dark:border-border-dark flex items-center justify-center">
          <Gavel size={24} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
      </div>
      <div>
        <p className="font-quicksand font-black text-lg text-text-light dark:text-text-dark mb-2">No auctions yet</p>
        <p className="text-sm font-mono text-muted-light dark:text-muted-dark max-w-xs leading-relaxed">
          Check back soon — we run auctions throughout the year to support our rescue dogs.
        </p>
      </div>
    </motion.div>
  )
}
