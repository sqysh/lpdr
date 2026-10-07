'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { LayoutGrid } from 'lucide-react'
import { FooterStep } from './FooterStep'

type Neighbour = { id: string; name: string } | null

export function DachshundFixedFooterNav({
  prev,
  next,
  position,
  total
}: {
  prev: Neighbour
  next: Neighbour
  position: number
  total: number
}) {
  const navRef = useRef<HTMLElement>(null)

  // Same as the auction bar: publishes the bar's height so the cookie notice sits above it,
  // and so the body padding in globals.css keeps the site footer clear of it
  useEffect(() => {
    const el = navRef.current
    if (!el) return

    const root = document.documentElement
    const publish = () => root.style.setProperty('--bottom-bar-height', `${el.offsetHeight}px`)

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)

    return () => {
      observer.disconnect()
      root.style.removeProperty('--bottom-bar-height')
    }
  }, [])

  return (
    <nav
      ref={navRef}
      aria-label="Browse dachshunds"
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-light dark:bg-bg-dark border-t border-border-light dark:border-border-dark pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-4xl mx-auto flex items-stretch">
        <FooterStep
          href={prev ? `/dachshunds/${prev.id}` : null}
          name={prev?.name ?? ''}
          direction="prev"
          label={prev ? `Previous dachshund: ${prev.name}` : ''}
        />

        <Link
          href="/dachshunds"
          className="flex-1 min-h-12 min-w-0 flex items-center justify-center gap-2 px-3 text-[11px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <LayoutGrid size={13} className="shrink-0" aria-hidden="true" />
          <span className="truncate">
            All dogs{' '}
            <span className="tabular-nums opacity-70">
              · {position} of {total}
            </span>
          </span>
        </Link>

        <FooterStep
          href={next ? `/dachshunds/${next.id}` : null}
          name={next?.name ?? ''}
          direction="next"
          label={next ? `Next dachshund: ${next.name}` : ''}
        />
      </div>
    </nav>
  )
}
