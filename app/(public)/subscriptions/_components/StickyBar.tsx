import { useEffect, useRef, useState } from 'react'
import { T } from 'lib/constants/subscriptions.constants'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export function StickyBar({ selected, selectedTier, billing, setView }) {
  const [loading, setLoading] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  const handleSubscribe = () => {
    if (loading) return
    setLoading(true)
    timeout.current = setTimeout(() => setView('payment'), 1000)
  }

  return (
    <AnimatePresence>
      {selected && selectedTier && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          className="fixed bottom-0 left-0 right-0 z-50"
          role="region"
          aria-label="Selected plan checkout"
          aria-live="polite"
        >
          <div className="border-t border-border-dark/90 bg-navbar-dark/90 px-4 py-4 sm:py-5">
            <div className="max-w-5xl mx-auto flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4">
              <div className="flex items-center gap-5 flex-wrap">
                <div>
                  <span className="block text-[9px] font-mono tracking-[0.2em] uppercase text-on-dark mb-0.5">Selected</span>
                  <span className={`font-quicksand font-black text-lg leading-none ${T[selectedTier.tier].darkPriceActive}`}>
                    {selectedTier.name}
                  </span>
                </div>
                <div className="w-px h-8 bg-white/10" aria-hidden="true" />
                <div>
                  <span className="block text-[9px] font-mono tracking-[0.2em] uppercase text-on-dark mb-0.5">{billing}</span>
                  <span className="font-quicksand font-black text-lg text-white">
                    ${selectedTier.price[billing]}
                    <span className="text-xs font-mono text-on-dark ml-1">/{billing === 'MONTHLY' ? 'mo' : 'yr'}</span>
                  </span>
                </div>
                {billing === 'YEARLY' && (
                  <>
                    <div className="w-px h-8 bg-white/10" aria-hidden="true" />
                    <div>
                      <span className="block text-[9px] font-mono tracking-[0.2em] uppercase text-on-dark mb-0.5">You save</span>
                      <span className={`font-quicksand font-black text-lg ${T[selectedTier.tier].darkPriceActive}`}>
                        ${selectedTier.price.MONTHLY * 12 - selectedTier.price.YEARLY}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <motion.button
                onClick={handleSubscribe}
                disabled={loading}
                aria-busy={loading}
                whileHover={loading ? {} : { scale: 1.03 }}
                whileTap={loading ? {} : { scale: 0.97 }}
                className="w-full xs:w-auto flex items-center justify-center gap-2 bg-primary-dark hover:bg-secondary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-[10px] tracking-[0.2em] uppercase py-3.5 px-10 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
                aria-label={`Subscribe to ${selectedTier.name} for $${selectedTier.price[billing]} per ${billing === 'MONTHLY' ? 'month' : 'year'}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    Loading
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
