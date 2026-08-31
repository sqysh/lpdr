'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

type Crumb = {
  label: string
  href: string
}

type Props = {
  /** Current page title — the last, non-linked breadcrumb segment. */
  title: string
  /**
   * Optional intermediate breadcrumbs between Dashboard and the title.
   * e.g. [{ label: 'Users', href: '/admin/users' }] renders
   * Dashboard / Users / {title}
   */
  breadcrumbs?: Crumb[]
  /** Optional count shown on the right (e.g. "5 users"). */
  count?: { value: number; noun: string }
  /** Optional action slot on the right — a button, link, etc. */
  action?: ReactNode
}

const crumbLinkClass =
  'inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

const separator = (
  <span className="text-[9px] font-mono text-border-light dark:text-border-dark" aria-hidden="true">
    /
  </span>
)

export default function AdminPageHeader({ title, breadcrumbs = [], count, action }: Props) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 h-10 flex items-center justify-between">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
        <Link href="/admin/dashboard" className={crumbLinkClass}>
          <LayoutDashboard className="w-3 h-3" aria-hidden="true" />
          Dashboard
        </Link>

        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-2 min-w-0">
            {separator}
            <Link href={crumb.href} className={`${crumbLinkClass} truncate`}>
              {crumb.label}
            </Link>
          </span>
        ))}

        {separator}

        <h1 className="text-[9px] font-mono tracking-[0.2em] uppercase text-text-light dark:text-text-dark truncate" aria-current="page">
          {title}
        </h1>
      </nav>

      {(count || action) && (
        <div className="flex items-center gap-3 shrink-0">
          {count && (
            <span className="hidden sm:inline text-[9px] font-mono tabular-nums text-muted-light dark:text-muted-dark">
              {count.value} {count.noun}
              {count.value === 1 ? '' : 's'}
            </span>
          )}
          {action}
        </div>
      )}
    </header>
  )
}
