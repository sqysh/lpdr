import { T, SUBSCRIPTION_TIERS } from 'lib/constants/subscriptions.constants'
import { motion } from 'framer-motion'
import { TierCard } from './TierCard'
import { MobileTierCard } from './MobileTierCard'
import { TierKey } from 'types/_subscriptions.types'
import { SubscriptionSelectorProps } from 'types/_my-pack.types'

export function SubscriptionSelector({
  setBilling,
  billing,
  selected,
  setSelected
}: SubscriptionSelectorProps) {
  return (
    <motion.div
      key="select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-44"
    >
      <div className="max-w-180 1000:max-w-240 1200:max-w-260 mx-auto">
        {/* ── Header ── */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-8 h-px bg-primary-dark" aria-hidden="true" />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-dark">Memberships</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-dark leading-tight mb-2">
                Pick Your <span className="font-light text-muted-dark">Rank</span>
              </h1>
              <p className="text-sm text-on-dark leading-relaxed">
                16 ways to support Little Paws. Every level funds rescue, vetting, and care.
              </p>
            </div>

            {/* Billing toggle */}
            <div
              role="group"
              aria-label="Billing frequency"
              className="flex items-center border border-border-dark self-start sm:self-auto shrink-0"
            >
              {(['MONTHLY', 'YEARLY'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  aria-pressed={billing === b}
                  className={`px-5 py-2.5 text-[10px] font-mono tracking-widest uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark
                          ${billing === b ? 'bg-button-dark text-white' : 'text-muted-dark hover:text-text-dark'}`}
                >
                  {b}
                  {b === 'YEARLY' && <span className="ml-1 text-primary-dark">↓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tier column labels ── */}
        <div className="hidden md:grid grid-cols-4 gap-2 mb-2" aria-hidden="true">
          {(['bronze', 'silver', 'gold', 'elite'] as TierKey[]).map((k) => (
            <p
              key={k}
              className={`text-center text-[9px] font-mono tracking-widest uppercase ${T[k].labelClass}`}
            >
              {T[k].label}
            </p>
          ))}
        </div>

        {/* ── Tier grid — md+ ── */}
        <div className="hidden md:block" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
          <div
            role="list"
            aria-label="Subscription tiers"
            className="grid grid-rows-4 grid-flow-col gap-2 sm:gap-3 mb-10"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {SUBSCRIPTION_TIERS.map((tier, i) => (
              <div key={tier.id} role="listitem">
                <TierCard
                  tier={tier}
                  billing={billing}
                  selected={selected === tier.id}
                  onSelect={() => setSelected(selected === tier.id ? null : tier.id)}
                  index={i}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Tier list — mobile ── */}
        <div className="md:hidden mb-10">
          <ul role="list" aria-label="Subscription tiers" className="space-y-2">
            {SUBSCRIPTION_TIERS.map((tier, i) => (
              <li key={tier.id} role="listitem">
                <MobileTierCard
                  tier={tier}
                  billing={billing}
                  selected={selected === tier.id}
                  onSelect={() => setSelected(selected === tier.id ? null : tier.id)}
                  index={i}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* ── Trust bar ── */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
          {['Cancel anytime', 'Secure payment', '100% goes to rescue'].map((item) => (
            <span key={item} className="flex items-center gap-2 text-[11px] text-muted-dark font-mono">
              <span className="w-1 h-1 bg-primary-dark" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
