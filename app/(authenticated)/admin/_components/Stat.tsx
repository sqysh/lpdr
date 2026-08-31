import { Package } from 'lucide-react'

export function Stat({
  icon: Icon,
  label,
  value,
  accent,
  sublabel
}: {
  icon: typeof Package
  label: string
  value: string
  accent?: boolean
  sublabel?: string
}) {
  return (
    <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-3">
      <p className="flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
        <Icon className="w-3 h-3" aria-hidden="true" />
        {label}
      </p>
      <p
        className={`mt-1 font-quicksand font-black text-xl tabular-nums ${
          accent
            ? 'text-primary-light dark:text-primary-dark'
            : 'text-text-light dark:text-text-dark'
        }`}
      >
        {value}
      </p>
      {sublabel && (
        <p className="mt-0.5 text-[9px] font-mono text-muted-light/70 dark:text-muted-dark/70 truncate">
          {sublabel}
        </p>
      )}
    </div>
  )
}
