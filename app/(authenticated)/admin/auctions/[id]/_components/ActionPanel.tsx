import { ReactNode } from 'react'

type Accent = 'primary' | 'amber' | 'red'

const accent = {
  primary: {
    rule: 'bg-primary-light dark:bg-primary-dark',
    label: 'text-primary-light dark:text-primary-dark',
    box: 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark'
  },
  amber: {
    rule: 'bg-amber-500',
    label: 'text-amber-500',
    box: 'border-amber-500/20 bg-amber-500/5'
  },
  red: {
    rule: 'bg-red-500 dark:bg-red-400',
    label: 'text-red-500 dark:text-red-400',
    box: 'border-red-500/20 dark:border-red-400/20 bg-red-500/5 dark:bg-red-400/5'
  }
} satisfies Record<Accent, { rule: string; label: string; box: string }>

export function ActionPanel({
  accent: tone,
  sectionLabel,
  title,
  description,
  children
}: {
  accent: Accent
  sectionLabel: string
  title: string
  description: string
  children: ReactNode
}) {
  const styles = accent[tone]

  return (
    <div className="pt-6 mt-6 border-t border-border-light dark:border-border-dark">
      <div className="flex items-center gap-3 mb-4">
        <span className={`block w-4 h-px shrink-0 ${styles.rule}`} aria-hidden="true" />
        <p className={`text-[10px] font-mono tracking-[0.2em] uppercase ${styles.label}`}>
          {sectionLabel}
        </p>
      </div>
      <div
        className={`border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${styles.box}`}
      >
        <div>
          <p className="text-xs font-mono text-text-light dark:text-text-dark font-medium mb-0.5">
            {title}
          </p>
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
