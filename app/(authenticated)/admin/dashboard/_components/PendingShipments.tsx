'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp, Truck } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'

export type Shipment = {
  id: string
  name: string
  items: string
  total: number
  createdAt: string
  address: string
}

export function ShipmentList({ shipments }: { shipments: Shipment[] }) {
  return (
    <div className="divide-y divide-border-light dark:divide-border-dark">
      {shipments.map((shipment) => (
        <div key={shipment.id} className="flex items-start justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-text-light dark:text-text-dark truncate">{shipment.name}</p>
            <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark truncate mt-0.5">{shipment.items}</p>
            <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark truncate">{shipment.address}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-xs font-bold text-text-light dark:text-text-dark tabular-nums mb-1">
              {formatMoney(shipment.total)}
            </p>
            <Link
              href={`/admin/transactions/${shipment.id}`}
              className="font-mono text-[10px] tracking-tag uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
            >
              Ship →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PendingShipments({ shipments }: { shipments: Shipment[] }) {
  const [open, setOpen] = useState(true)

  if (shipments.length === 0) return null

  return (
    <div className="hidden sm:block absolute top-4 right-4 w-72 border border-border-light dark:border-border-dark bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur">
      <div
        className={`px-4 py-3 flex items-center justify-between gap-2 ${open ? 'border-b border-border-light dark:border-border-dark' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <p className="font-mono text-[10px] tracking-eyebrow uppercase text-amber-500 truncate">
            Needs Shipping · {shipments.length} {shipments.length === 1 ? 'order' : 'orders'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {open && (
            <Link
              href="/admin/transactions"
              className="font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
            >
              View all
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Collapse pending shipments' : 'Expand pending shipments'}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <ChevronUp
              className={`w-4 h-4 text-muted-light dark:text-muted-dark shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="overflow-y-auto max-h-[50vh]">
          <ShipmentList shipments={shipments} />
        </div>
      )}
    </div>
  )
}
