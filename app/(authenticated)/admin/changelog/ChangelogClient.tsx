import { CHANGELOG, ChangeType } from 'lib/constants/changelog.constants'
import { formatDate } from 'lib/utils/date.utils'
import { Sparkles, Wrench, TrendingUp, Package } from 'lucide-react'

export const metadata = { title: 'Changelog — LPDR Admin' }

const TYPE_CONFIG: Record<ChangeType, { label: string; icon: typeof Sparkles; className: string }> =
  {
    feature: {
      label: 'New',
      icon: Sparkles,
      className:
        'text-primary-light dark:text-primary-dark border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/5 dark:bg-primary-dark/5'
    },
    fix: {
      label: 'Fix',
      icon: Wrench,
      className: 'text-red-500 border-red-500/30 bg-red-500/5'
    },
    improvement: {
      label: 'Improved',
      icon: TrendingUp,
      className: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
    },
    chore: {
      label: 'Chore',
      icon: Package,
      className:
        'text-muted-light dark:text-muted-dark border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark'
    }
  }

export default function ChangelogClient() {
  return (
    <main className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2">
            Admin
          </p>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Changelog</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">
            A running record of what&apos;s changed on the site.
          </p>
        </div>

        {/* Version list */}
        <div className="space-y-10">
          {CHANGELOG.map((entry, i) => (
            <section key={entry.version} className="relative">
              {/* Timeline connector */}
              {i !== CHANGELOG.length - 1 && (
                <div className="absolute left-3.75 top-9 -bottom-10 w-px bg-border-light dark:bg-border-dark" />
              )}

              <div className="flex items-start gap-4">
                {/* Version marker */}
                <div className="shrink-0 w-8 h-8 flex items-center justify-center border-2 border-primary-light dark:border-primary-dark bg-bg-light dark:bg-bg-dark z-10">
                  <span className="w-2 h-2 bg-primary-light dark:bg-primary-dark" />
                </div>

                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="font-mono text-lg font-bold text-text-light dark:text-text-dark">
                      v{entry.version}
                    </h2>
                    <span className="font-mono text-[11px] text-muted-light dark:text-muted-dark">
                      {formatDate(entry.date)}
                    </span>
                    {i === 0 && (
                      <span className="px-2 py-0.5 border border-primary-light/40 dark:border-primary-dark/40 text-primary-light dark:text-primary-dark text-[9px] font-mono tracking-[0.15em] uppercase">
                        Latest
                      </span>
                    )}
                  </div>

                  <h3 className="text-[15px] font-semibold text-text-light dark:text-text-dark mb-4">
                    {entry.title}
                  </h3>

                  <ul className="space-y-2.5">
                    {entry.changes.map((change, idx) => {
                      const config = TYPE_CONFIG[change.type]
                      const Icon = config.icon
                      return (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span
                            className={`shrink-0 mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 border text-[8px] font-mono tracking-widest uppercase ${config.className}`}
                          >
                            <Icon className="w-2.5 h-2.5" aria-hidden="true" />
                            {config.label}
                          </span>
                          <span className="text-[13px] text-text-light dark:text-text-dark leading-relaxed">
                            {change.text}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
