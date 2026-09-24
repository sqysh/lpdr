export function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-f10 font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">{eyebrow}</p>
      <h2 className="font-quicksand font-bold text-2xl sm:text-3xl text-text-light dark:text-text-dark">{title}</h2>
      {children && <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">{children}</p>}
    </div>
  )
}

export function AgreeCheckbox({
  id,
  label,
  error,
  ...rest
}: { id: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
        <input id={id} type="checkbox" className="mt-0.5 w-5 h-5 shrink-0 accent-primary-light dark:accent-primary-dark" {...rest} />
        <span className="text-sm text-text-light dark:text-text-dark leading-relaxed">{label}</span>
      </label>
      {error && (
        <p role="alert" className="mt-1.5 text-[11px] font-mono text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export function Fact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-border-light dark:border-border-dark">
      <dt className="text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">{label}</dt>
      <dd className="text-sm text-text-light dark:text-text-dark text-right">{value || '—'}</dd>
    </div>
  )
}

export function StatusPanel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-3">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="font-quicksand font-bold text-2xl text-text-light dark:text-text-dark">{title}</h2>
      </div>
      <div className="text-sm text-muted-light dark:text-muted-dark leading-relaxed space-y-3">{children}</div>
    </div>
  )
}
