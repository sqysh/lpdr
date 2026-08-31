import { motion } from 'framer-motion'

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
  delay = 0
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  iconColor: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-bg-light dark:bg-bg-dark px-4 py-3"
    >
      <p className="flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
        <Icon size={11} className={iconColor} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 font-quicksand font-black text-xl tabular-nums text-text-light dark:text-text-dark leading-none">
        {value}
      </p>
      {sub && <p className="text-[9px] font-mono text-muted-light/60 dark:text-muted-dark/60 mt-1">{sub}</p>}
    </motion.div>
  )
}
