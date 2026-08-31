import { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  caption: string
  adminNote?: string
  isLast?: boolean
}

export function FlowStep({ icon: Icon, title, caption, adminNote, isLast }: Props) {
  return (
    <>
      {/* ── Mobile: timeline row ── */}
      <div className="flex md:hidden gap-3">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-8 h-8 flex items-center justify-center border border-primary-light/40 dark:border-primary-dark/40 bg-primary-light/5 dark:bg-primary-dark/5">
            <Icon className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark" aria-hidden="true" />
          </div>
          {!isLast && <div className="w-px flex-1 bg-border-light dark:bg-border-dark mt-1.5 mb-1.5" />}
        </div>
        <div className={`min-w-0 ${!isLast ? 'pb-5' : ''}`}>
          <p className="font-quicksand font-black text-[13px] text-text-light dark:text-text-dark leading-snug mb-0.5">
            {title}
          </p>
          <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">{caption}</p>
          {adminNote && (
            <p className="text-[10px] font-mono text-primary-light dark:text-primary-dark mt-1.5 leading-relaxed">
              {adminNote}
            </p>
          )}
        </div>
      </div>

      {/* ── Desktop: box, shares available width equally, never overflows ── */}
      <div className="hidden md:flex md:flex-col flex-1 min-w-0 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-3">
        <Icon className="w-4 h-4 text-primary-light dark:text-primary-dark mb-2 shrink-0" aria-hidden="true" />
        <p className="font-quicksand font-black text-[12px] text-text-light dark:text-text-dark leading-snug mb-1 wrap-break-word">
          {title}
        </p>
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed wrap-break-word">
          {caption}
        </p>
        {adminNote && (
          <p className="text-[9px] font-mono text-primary-light dark:text-primary-dark mt-2 pt-2 border-t border-border-light dark:border-border-dark leading-relaxed wrap-break-word">
            {adminNote}
          </p>
        )}
      </div>
    </>
  )
}
