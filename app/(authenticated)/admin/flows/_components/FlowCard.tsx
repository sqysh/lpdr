'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FlowDiagram, FlowStepData } from './FlowDiagram'
import { ICON_MAP, IconKey } from './iconMap'
import { Highlight } from './Highlight'

type Props = {
  id: string
  icon: IconKey
  title: string
  summary: string
  steps: FlowStepData[]
  faq?: { question: string; answer: string }[]
  query?: string
  forceOpen?: boolean
}

export function FlowCard({ id, icon, title, summary, steps, faq, query = '', forceOpen = false }: Props) {
  const [open, setOpen] = useState(forceOpen)
  const Icon = ICON_MAP[icon]

  return (
    <section id={id} className="border border-border-light dark:border-border-dark scroll-mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 sm:gap-4 px-3.5 sm:px-5 py-3.5 sm:py-4 text-left bg-surface-light dark:bg-surface-dark hover:bg-bg-light dark:hover:bg-bg-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Icon className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-quicksand font-black text-[13px] sm:text-sm text-text-light dark:text-text-dark truncate">
              <Highlight text={title} query={query} />
            </p>
            <p className="text-[10px] sm:text-[11px] font-mono text-muted-light dark:text-muted-dark truncate">
              {summary}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-light dark:text-muted-dark shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="px-3.5 sm:px-5 py-4 sm:py-6 border-t border-border-light dark:border-border-dark space-y-5 sm:space-y-6">
          <FlowDiagram steps={steps} />

          {faq && faq.length > 0 && (
            <div className="pt-2 space-y-3.5 sm:space-y-4">
              <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Common questions
              </p>
              {faq.map((f, i) => {
                const matches =
                  query.trim() &&
                  (f.question.toLowerCase().includes(query.toLowerCase()) ||
                    f.answer.toLowerCase().includes(query.toLowerCase()))
                return (
                  <div
                    key={i}
                    className={matches ? 'border-l-2 border-primary-light dark:border-primary-dark pl-3 -ml-3' : ''}
                  >
                    <p className="text-[11px] sm:text-xs font-mono font-bold text-text-light dark:text-text-dark mb-1">
                      <Highlight text={f.question} query={query} />
                    </p>
                    <p className="text-[11px] sm:text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed">
                      <Highlight text={f.answer} query={query} />
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
