export function PanelHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shrink-0">
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">{label}</span>
      {action}
    </div>
  )
}
