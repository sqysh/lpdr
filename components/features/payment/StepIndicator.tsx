import { Check } from 'lucide-react'
import { useThemeStore } from 'stores/theme.store'

export function StepIndicator({
  current,
  labels,
  isDark
}: {
  current: number
  total: number
  labels: string[]
  isDark?: boolean
}) {
  const storeDark = useThemeStore((s) => s.isDark)
  const dark = isDark ?? storeDark

  const c = {
    boxDone: dark ? 'border-primary-dark bg-primary-dark' : 'border-primary-light bg-primary-light',
    boxActive: dark ? 'border-primary-dark' : 'border-primary-light',
    boxIdle: dark ? 'border-border-dark' : 'border-border-light',
    textActive: dark ? 'text-primary-dark' : 'text-primary-light',
    textIdle: dark ? 'text-muted-dark' : 'text-muted-light',
    lineDone: dark ? 'bg-primary-dark' : 'bg-primary-light',
    lineIdle: dark ? 'bg-border-dark' : 'bg-border-light'
  }

  return (
    <div className="mb-10" role="list" aria-label="Checkout steps">
      <div className="flex items-center gap-0">
        {labels.map((label, i) => {
          const stepNum = i + 1
          const isDone = stepNum < current
          const isActive = stepNum === current
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none" role="listitem">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-6 h-6 flex items-center justify-center border-2 transition-colors duration-200
                  ${isDone ? c.boxDone : isActive ? c.boxActive : c.boxIdle}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? (
                    <Check className="w-3 h-3 text-white" aria-hidden="true" />
                  ) : (
                    <span
                      className={`text-[10px] font-mono font-bold ${isActive ? c.textActive : c.textIdle}`}
                    >
                      {stepNum}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-mono tracking-[0.15em] uppercase whitespace-nowrap hidden sm:block
                  ${isActive ? c.textActive : c.textIdle}`}
                >
                  {label}
                </span>
              </div>
              {i < labels.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 mb-4 sm:mb-5 transition-colors duration-200 ${isDone ? c.lineDone : c.lineIdle}`}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
