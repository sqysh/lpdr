export function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark  px-4 py-3 min-w-0">
      <span className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
        {label}
      </span>
      <span className="text-sm font-semibold text-text-light dark:text-text-dark truncate">
        {value}
      </span>
    </div>
  )
}
