import { useSounds } from 'lib/hooks/useSounds.hook'
import { T, TIERS } from 'lib/constants/subscriptions.constants'
import { AnimatePresence, motion } from 'framer-motion'
import { BillingInterval } from 'types/_my-pack.types'

export function TierCard({
  tier,
  billing,
  selected,
  onSelect,
  index
}: {
  tier: (typeof TIERS)[0]
  billing: BillingInterval
  selected: boolean
  onSelect: () => void
  index: number
}) {
  const { play } = useSounds({ enabled: true })
  const s = T[tier.tier]
  const price = tier.price[billing]

  const price_c = selected ? s.darkPriceActive : s.darkPrice
  const name_c = selected ? s.darkNameActive : s.darkName

  const corners = [
    ['top-[6px] left-[6px]', 'border-t-[1.5px] border-l-[1.5px]'],
    ['top-[6px] right-[6px]', 'border-t-[1.5px] border-r-[1.5px]'],
    ['bottom-[6px] left-[6px]', 'border-b-[1.5px] border-l-[1.5px]'],
    ['bottom-[6px] right-[6px]', 'border-b-[1.5px] border-r-[1.5px]']
  ]

  return (
    <motion.div
      onClick={() => play('se1')}
      key={tier.name}
      initial={{ opacity: 0, rotateY: 90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      style={{ transformStyle: 'preserve-3d' }}
      className="aspect-video"
    >
      <motion.button
        onClick={onSelect}
        whileHover={{ scale: 1.07, y: -5 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        aria-pressed={selected}
        aria-label={`${tier.name} — $${price} per ${billing === 'MONTHLY' ? 'month' : 'year'}${tier.badge ? ` — ${tier.badge}` : ''}`}
        className={`
      relative w-full h-full overflow-hidden border-2 flex flex-col items-center justify-center gap-1
      transition-[border-color] duration-200
      focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-primary-dark
      ${selected ? s.darkBorderActive : s.darkBorderIdle}
    `}
        style={{
          background: `repeating-linear-gradient(45deg,${s.darkStripe} 0,${s.darkStripe} 1px,transparent 1px,transparent 8px), ${
            selected ? s.darkActiveBg : s.darkIdleBg
          }`,
          boxShadow: selected ? s.darkGlow : '0 2px 12px rgba(0,0,0,.55)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        {/* ── Pulse ring ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key="ring"
              className="absolute -inset-0.5 border-[1.5px] pointer-events-none"
              style={{ borderColor: s.darkGlow.match(/rgba\([^)]+\)/)?.[0] ?? 'transparent' }}
              animate={{ opacity: [0.85, 0], scale: [0.95, 1.14] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeOut' }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* ── Top gloss ── */}
        <div
          className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg,rgba(255,255,255,.06) 0%,transparent 100%)'
          }}
          aria-hidden="true"
        />

        {/* ── Shine ── */}
        <motion.div
          className={`absolute z-10 inset-0 bg-linear-to-r from-transparent ${s.darkShineVia} to-transparent pointer-events-none`}
          style={{ skewX: -15 }}
          animate={{ x: ['-130%', '230%'] }}
          transition={
            selected
              ? { duration: 0.72, repeat: Infinity, repeatDelay: 0.28, ease: 'easeInOut' }
              : { duration: 3.8, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }
          }
          aria-hidden="true"
        />

        <AnimatePresence>
          {selected && (
            <motion.div
              key="shine2"
              className="absolute z-10 inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none"
              style={{ skewX: -15 }}
              animate={{ x: ['-130%', '230%'] }}
              transition={{
                duration: 0.72,
                repeat: Infinity,
                repeatDelay: 0.28,
                delay: 0.2,
                ease: 'easeInOut'
              }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* ── Corner ornaments ── */}
        {corners.map(([pos, borders], ci) => (
          <div
            key={ci}
            className={`absolute w-2.5 h-2.5 ${pos} ${borders} ${s.darkCorner} pointer-events-none`}
            aria-hidden="true"
          />
        ))}

        {/* ── Bottom edge glow ── */}
        <motion.div
          className={`absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent ${s.darkEdgeVia} to-transparent pointer-events-none`}
          animate={{ opacity: selected ? [0.55, 1, 0.55] : [0.18, 0.45, 0.18] }}
          transition={{ duration: selected ? 1.2 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />

        {/* ── Badge ── */}
        {tier.badge && (
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute top-1.5 right-1.5 text-[7.5px] font-black tracking-[.15em] uppercase px-1.5 py-0.75 z-10 pointer-events-none ${s.darkBadge}`}
          >
            {tier.badge}
          </motion.span>
        )}

        {/* ── Text ── */}
        <span
          className={`font-mono text-[9px] tracking-[.2em] uppercase pointer-events-none ${s.darkRank}`}
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <motion.span
          animate={selected ? { scale: [1, 1.14, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`font-quicksand font-black leading-none pointer-events-none text-2xl sm:text-3xl transition-colors duration-200 ${price_c}`}
        >
          ${price}
        </motion.span>

        <span className={`font-mono text-[9px] pointer-events-none ${s.darkRank}`}>
          /{billing === 'MONTHLY' ? 'mo' : 'yr'}
        </span>

        <span
          className={`font-bebas font-bold text-[10px] md:text-2xl lg:text-3xl text-center leading-tight px-2 pointer-events-none transition-colors duration-200 ${name_c}`}
        >
          {tier.name}
        </span>
      </motion.button>
    </motion.div>
  )
}
