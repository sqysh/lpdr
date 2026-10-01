'use client'

import { ReactNode, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LucideIcon, X } from 'lucide-react'

export type DockTab = {
  id: string
  label: string
  value: string
  title: string
  icon: LucideIcon
  tone?: 'primary' | 'amber'
  content: ReactNode
}

const TONES = {
  primary: 'text-primary-light dark:text-primary-dark',
  amber: 'text-amber-500'
}

/** Mobile only: each dashboard panel is a small tile along the bottom of the map, opening as a sheet */
export function MobileDock({
  tabs,
  openId,
  onOpenChange
}: {
  tabs: DockTab[]
  openId: string | null
  onOpenChange: (id: string | null) => void
}) {
  const open = tabs.find((t) => t.id === openId) ?? null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  return (
    <div className="sm:hidden">
      <div
        className="absolute inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onOpenChange(tab.id)}
              aria-haspopup="dialog"
              aria-expanded={openId === tab.id}
              className="min-w-0 px-2.5 py-2 text-left border border-border-light dark:border-border-dark bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <p className={`font-quicksand font-black text-sm tabular-nums leading-none truncate ${TONES[tab.tone ?? 'primary']}`}>
                {tab.value}
              </p>
              <p className="mt-1.5 flex items-center gap-1 min-w-0 font-mono text-[9px] tracking-tag uppercase text-muted-light dark:text-muted-dark">
                <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{tab.label}</span>
              </p>
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              className="absolute inset-0 z-30 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(null)}
              aria-hidden="true"
            />

            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dashboard-sheet-title"
              className="absolute inset-x-0 bottom-0 z-40 max-h-[75%] flex flex-col border-t border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark pb-[env(safe-area-inset-bottom)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border-light dark:border-border-dark">
                <p
                  id="dashboard-sheet-title"
                  className="font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark truncate"
                >
                  {open.title}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenChange(null)}
                  aria-label="Close"
                  autoFocus
                  className="p-1 -m-1 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  <X className="w-4 h-4 text-muted-light dark:text-muted-dark" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto">{open.content}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
