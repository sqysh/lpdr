'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, ListFilter } from 'lucide-react'

type Props<T extends string> = {
  /** The list of filter options (e.g. ['ALL', 'DRAFT', 'ACTIVE', 'ENDED']). */
  options: readonly T[]
  /** Currently selected option. */
  value: T
  /** Called when an option is selected. */
  onChange: (value: T) => void
  /** Count shown next to each option, keyed by option. */
  counts?: Record<T, number>
  /** Human-readable labels per option. Falls back to a title-cased version. */
  labels?: Record<T, string>
  /** Accessible label for the control (e.g. "Filter orders by type"). */
  label: string
}

const defaultLabel = (s: string) =>
  s === 'ALL'
    ? 'All'
    : s
        .toLowerCase()
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

export default function AdminFilterTabs<T extends string>({ options, value, onChange, counts, labels, label }: Props<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const getLabel = (opt: T) => labels?.[opt] ?? defaultLabel(opt)

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const select = (opt: T) => {
    onChange(opt)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative w-fit">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex items-center gap-2 px-3 py-2 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-[9px] font-mono tracking-[0.2em] uppercase text-text-light dark:text-text-dark transition-colors hover:border-primary-light/50 dark:hover:border-primary-dark/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <ListFilter className="w-3 h-3 text-muted-light dark:text-muted-dark" aria-hidden="true" />
        <span>{getLabel(value)}</span>
        {counts && <span className="text-primary-light dark:text-primary-dark tabular-nums">{counts[value]}</span>}
        <ChevronDown
          className={`w-3 h-3 text-muted-light dark:text-muted-dark transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Popover */}
      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full mt-1 z-20 min-w-55 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark shadow-lg py-1"
        >
          {options.map((opt) => {
            const selected = value === opt
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => select(opt)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors focus:outline-none focus-visible:bg-primary-light/10 dark:focus-visible:bg-primary-dark/10 ${
                  selected ? 'bg-primary-light/10 dark:bg-primary-dark/10' : 'hover:bg-surface-light dark:hover:bg-surface-dark'
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 shrink-0 text-primary-light dark:text-primary-dark ${selected ? 'opacity-100' : 'opacity-0'}`}
                  aria-hidden="true"
                />
                <span
                  className={`flex-1 text-[9px] font-mono tracking-[0.2em] uppercase ${
                    selected ? 'text-text-light dark:text-text-dark' : 'text-muted-light dark:text-muted-dark'
                  }`}
                >
                  {getLabel(opt)}
                </span>
                {counts && <span className="text-[9px] font-mono tabular-nums text-primary-light dark:text-primary-dark">{counts[opt]}</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
