import { useEffect, useRef, useState } from 'react'
import { SUBSCRIPTION_TIERS } from 'lib/constants/subscriptions.constants'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BillingInterval } from 'types/subscriptions.types'

export function StickyHeader({
  billing,
  selected,
  onSubscribe,
  view
}: {
  billing: BillingInterval
  selected: string | null
  onSubscribe: () => void
  view: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedTier = SUBSCRIPTION_TIERS.find((t) => t.id === selected)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  const handleSubscribe = () => {
    if (loading) return
    setLoading(true)
    timeout.current = setTimeout(() => {
      onSubscribe()
      setLoading(false)
    }, 1000)
  }

  if (view !== 'select') return null

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
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-dark">Subscriptions</p>
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
                ${selectedTier.price[billing]}/{billing === 'MONTHLY' ? 'mo' : 'yr'}
              </span>
            </motion.p>
          ) : (
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-dark">Select a tier</p>
          )}
        </div>

        {/* Right — CTA */}
        <button
          onClick={handleSubscribe}
          disabled={!selected || loading}
          aria-busy={loading}
          aria-label={selectedTier ? `Subscribe to ${selectedTier.name}` : 'Select a tier to subscribe'}
          className="shrink-0 flex items-center gap-2 px-4 py-1.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-dark text-bg-dark hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              Loading
            </>
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
    </motion.div>
  )
}
