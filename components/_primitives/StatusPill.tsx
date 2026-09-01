export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'bg-green-500/10 text-green-600 dark:text-green-400',
    succeeded: 'bg-green-500/10 text-green-600 dark:text-green-400',
    canceled: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark',
    past_due: 'bg-red-500/10 text-red-500 dark:text-red-400',
    ended: 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
  }
  return <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 ${map[status] ?? map.ended}`}>{status.replace('_', ' ')}</span>
}
