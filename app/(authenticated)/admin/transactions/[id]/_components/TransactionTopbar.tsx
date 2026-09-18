import Link from 'next/link'
import { STATUS_STYLES, getOrderSection } from 'lib/constants/order.constants'
import { IOrder } from 'types/order.types'
import { useLinkStatus } from 'next/link'
import { Loader2 } from 'lucide-react'

/** Sits inside the breadcrumb Link so useLinkStatus can see it; the slash becomes the spinner mid-navigation */
export function BreadcrumbSlash() {
  const { pending } = useLinkStatus()

  return pending ? (
    <Loader2 className="w-2.5 h-2.5 animate-spin text-primary-light dark:text-primary-dark" aria-hidden="true" />
  ) : (
    <span className="text-[9px] font-mono text-border-light dark:text-border-dark" aria-hidden="true">
      /
    </span>
  )
}

export function TransactionTopbar({ order }: { order: IOrder }) {
  const section = getOrderSection(order)

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 h-10 flex items-center justify-between">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
        <Link
          href={section.href}
          className="flex items-center gap-2 text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <BreadcrumbSlash />
          {section.label}
        </Link>
        <span className="text-[9px] font-mono text-border-light dark:text-border-dark" aria-hidden="true">
          /
        </span>
        <p className="text-[9px] font-mono tracking-tag uppercase text-text-light dark:text-text-dark truncate" aria-current="page">
          #{order.id.slice(-8)}
        </p>
      </nav>
      <span
        className={`shrink-0 inline-flex items-center px-2 py-0.5 border text-[8px] font-mono tracking-eyebrow uppercase ${
          STATUS_STYLES[order.status] ?? 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
        }`}
      >
        {order.status}
      </span>
    </header>
  )
}
