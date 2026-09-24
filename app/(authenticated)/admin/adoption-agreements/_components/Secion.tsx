const IS_DEV = process.env.NODE_ENV !== 'production'

export function Section({
  step,
  title,
  onFill,
  children
}: {
  step: number
  title: string
  onFill?: () => void
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby={`step-${step}`} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2
          id={`step-${step}`}
          className="flex items-center gap-3 text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
        >
          <span className="w-5 h-5 flex items-center justify-center border border-border-light dark:border-border-dark text-text-light dark:text-text-dark">
            {step}
          </span>
          {title}
        </h2>
        {IS_DEV && onFill && (
          <button
            type="button"
            onClick={onFill}
            className="px-2 py-1 border border-dashed border-amber-500/60 text-[9px] font-mono tracking-eyebrow uppercase text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          >
            Fill test data
          </button>
        )}
      </div>
      {children}
    </section>
  )
}
