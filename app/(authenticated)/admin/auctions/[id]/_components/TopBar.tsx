import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export function TopBar({ auction, statusConfig }) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 h-10 flex items-center justify-between gap-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <LayoutDashboard className="w-3 h-3" aria-hidden="true" />
          Dashboard
        </Link>
        <span className="text-[9px] font-mono text-border-light dark:text-border-dark" aria-hidden="true">
          /
        </span>
        <Link
          href="/admin/auctions"
          className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          Auctions
        </Link>
        <span className="text-[9px] font-mono text-border-light dark:text-border-dark" aria-hidden="true">
          /
        </span>
        <h1
          className="text-[9px] font-mono tracking-[0.15em] uppercase text-text-light dark:text-text-dark truncate"
          aria-current="page"
        >
          {auction.title}
        </h1>
      </nav>

      <span className={`shrink-0 text-[8px] font-black tracking-widest uppercase px-2 py-0.5 ${statusConfig.classes}`}>
        {statusConfig.label}
      </span>
    </header>
  )
}
