'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Check, Loader2 } from 'lucide-react'
import { formatDate } from 'lib/utils/date.utils'
import { dismissAuctionAnomaly } from 'lib/actions/super-user/dismissAuctionAnomaly'
import { AuctionAnomaly } from 'lib/actions/super-user/getAuctionAnomalies'

const LABEL = 'font-mono text-[8px] tracking-[0.12em] uppercase'

/**
 * Sits above the service strip because it outranks it: a red service is something to watch, an
 * anomaly is money already at stake.
 */
export function AnomalyStrip({ anomalies }: { anomalies: AuctionAnomaly[] }) {
  const router = useRouter()
  const [dismissing, setDismissing] = useState<string | null>(null)

  if (anomalies.length === 0) return null

  const dismiss = async (id: string) => {
    setDismissing(id)
    await dismissAuctionAnomaly(id)
    setDismissing(null)
    router.refresh()
  }

  return (
    <div className="shrink-0 border-t border-red-500/30 bg-red-500/5">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-red-500/20">
        <AlertTriangle size={9} className="text-red-500 shrink-0" aria-hidden="true" />
        <span className={`${LABEL} text-red-500`}>
          {anomalies.length} anomal{anomalies.length === 1 ? 'y' : 'ies'}
        </span>
      </div>

      <div className="max-h-28 overflow-y-auto divide-y divide-red-500/10">
        {anomalies.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-3 py-1.5">
            <span className={`${LABEL} text-red-500 shrink-0 w-44 truncate`}>{a.type.replaceAll('_', ' ')}</span>

            <Link
              href={`/admin/auctions/${a.auction.id}`}
              className="font-mono text-[9px] text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors shrink-0 truncate max-w-40"
            >
              {a.auction.title}
            </Link>

            <span className="font-mono text-[9px] text-muted-light dark:text-muted-dark flex-1 truncate">
              {a.itemName ? `${a.itemName}: ` : ''}
              {a.message}
            </span>

            <span className="font-mono text-[9px] text-muted-light dark:text-muted-dark shrink-0 tabular-nums">
              {formatDate(a.createdAt, true)}
            </span>

            <button
              type="button"
              onClick={() => dismiss(a.id)}
              disabled={dismissing === a.id}
              aria-label={`Dismiss ${a.type.replaceAll('_', ' ').toLowerCase()}`}
              className="shrink-0 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {dismissing === a.id ? (
                <Loader2 size={11} className="animate-spin" aria-hidden="true" />
              ) : (
                <Check size={11} aria-hidden="true" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
