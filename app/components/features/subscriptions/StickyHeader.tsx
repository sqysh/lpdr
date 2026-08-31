import { TIERS } from 'lib/constants/subscriptions.constants'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function StickyHeader({
  billing,
  selected,
  onSubscribe,
  view
}: {
  billing: 'monthly' | 'yearly'
  selected: string | null
  onSubscribe: () => void
  view: string
}) {
  const router = useRouter()
  const selectedTier = TIERS.find((t) => t.id === selected)

  if (view !== 'select') return

  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-border-dark bg-bg-dark/90 backdrop-blur-sm"
    >
      <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 h-11 flex items-center justify-between gap-4">
        {/* Left — label */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => router.back()}
            aria-label="Go back to home"
            className="text-text-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark"
          >
            <ArrowLeft size={14} aria-hidden="true" />
          </button>
          <span className="block w-4 h-px bg-primary-dark shrink-0" aria-hidden="true" />
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-dark">
            Subscriptions
          </p>
        </div>

        {/* Center — selected tier */}
        <div className="flex-1 flex items-center justify-between min-w-0">
          {selectedTier ? (
            <motion.p
              key={selectedTier.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-dark truncate"
            >
              {selectedTier.name}&nbsp;
              <span className="text-primary-dark">
                ${selectedTier.price[billing]}/{billing === 'monthly' ? 'mo' : 'yr'}
              </span>
            </motion.p>
          ) : (
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-dark">
              Select a tier
            </p>
          )}
        </div>

        {/* Right — CTA */}
        {view === 'select' && (
          <button
            onClick={onSubscribe}
            disabled={!selected}
            aria-label={
              selectedTier ? `Subscribe to ${selectedTier.name}` : 'Select a tier to subscribe'
            }
            className="shrink-0 px-4 py-1.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-dark text-bg-dark hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Subscribe
          </button>
        )}
      </div>
    </motion.div>
  )
}
