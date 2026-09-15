import { Eye, EyeOff, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { LinkBody } from 'components/_common/LinkBody'
import { getAuctionStatusConfig } from 'lib/utils/auction.utils'
import { IAuctionDetail } from 'types/auction.types'

const crumbLink =
  'text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

type Props = {
  auction: IAuctionDetail
  statusConfig: ReturnType<typeof getAuctionStatusConfig>
}

export function TopBar({ auction, statusConfig }: Props) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 h-10 flex items-center justify-between gap-4">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
        <Link href="/admin/dashboard" className={`inline-flex items-center gap-1.5 ${crumbLink}`}>
          <LinkBody icon={<LayoutDashboard className="w-3 h-3" aria-hidden="true" />} label="Dashboard" />
        </Link>

        <span className="text-[9px] font-mono text-border-light dark:text-border-dark" aria-hidden="true">
          /
        </span>

        <Link href="/admin/auctions" className={`inline-flex items-center gap-1.5 ${crumbLink}`}>
          <LinkBody icon={null} label="Auctions" />
        </Link>

        <span className="text-[9px] font-mono text-border-light dark:text-border-dark" aria-hidden="true">
          /
        </span>

        <h1 className="text-[9px] font-mono tracking-tag uppercase text-text-light dark:text-text-dark truncate" aria-current="page">
          {auction.title}
        </h1>
      </nav>

      <div className="shrink-0 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`block w-1.5 h-1.5 shrink-0 ${statusConfig.dotClass}`} aria-hidden="true" />
          <span className={`text-[9px] font-mono tracking-eyebrow uppercase ${statusConfig.textClass}`}>{statusConfig.label}</span>
          <span className="hidden lg:inline text-[9px] font-mono text-muted-light dark:text-muted-dark">{statusConfig.description}</span>
        </div>

        {auction.status === 'DRAFT' && (
          <>
            <span className="w-px h-3 bg-border-light dark:bg-border-dark" aria-hidden="true" />
            <div className="flex items-center gap-1.5">
              {auction.isPubliclyVisible ? (
                <Eye className="w-3 h-3 text-emerald-500" aria-hidden="true" />
              ) : (
                <EyeOff className="w-3 h-3 text-muted-light dark:text-muted-dark" aria-hidden="true" />
              )}
              <span
                className={`text-[9px] font-mono tracking-eyebrow uppercase ${
                  auction.isPubliclyVisible ? 'text-emerald-500' : 'text-muted-light dark:text-muted-dark'
                }`}
              >
                {auction.isPubliclyVisible ? 'On the site' : 'Hidden'}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
