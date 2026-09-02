'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp, Truck } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'

type Shipment = {
  id: string
  name: string
  items: string
  total: number
  createdAt: string
  address: string
}

export function PendingShipments({ shipments }: { shipments: Shipment[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)

  if (shipments.length === 0) return null

  const heading = (
    <div className="flex items-center gap-2 min-w-0">
      <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500 truncate">
        Needs Shipping · {shipments.length} {shipments.length === 1 ? 'order' : 'orders'}
      </p>
    </div>
  )

  const list = (
    <div className="divide-y divide-border-light dark:divide-border-dark overflow-y-auto max-h-[40vh] sm:max-h-[50vh]">
      {shipments.map((shipment) => (
        <div key={shipment.id} className="flex items-start justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-text-light dark:text-text-dark truncate">
              {shipment.name}
            </p>
            <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark truncate mt-0.5">
              {shipment.items}
            </p>
            <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark truncate">
              {shipment.address}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-xs font-bold text-text-light dark:text-text-dark tabular-nums mb-1">
              {formatMoney(shipment.total)}
            </p>
            <Link
              href={`/admin/orders/${shipment.id}`}
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
            >
              Ship →
            </Link>
          </div>
        </div>
      ))}
    </div>
  )

  const chevron = (open: boolean) => (
    <ChevronUp
      className={`w-4 h-4 text-muted-light dark:text-muted-dark shrink-0 transition-transform ${
        open ? 'rotate-180' : ''
      }`}
      aria-hidden="true"
    />
  )

  return (
    <>
      {/* Mobile — collapsible sheet above the stats sheet */}
      <div className="sm:hidden absolute bottom-13 inset-x-0 border-t border-amber-500/30 bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {heading}
          {chevron(mobileOpen)}
        </button>

        {mobileOpen && (
          <div className="border-t border-border-light dark:border-border-dark">{list}</div>
        )}
      </div>

      {/* Desktop — top right, collapsible */}
      <div className="hidden sm:block absolute top-4 right-4 w-72 border border-border-light dark:border-border-dark bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur">
        <div
          className={`px-4 py-3 flex items-center justify-between gap-2 ${
            desktopOpen ? 'border-b border-border-light dark:border-border-dark' : ''
          }`}
        >
          {heading}

          <div className="flex items-center gap-3 shrink-0">
            {desktopOpen && (
              <Link
                href="/admin/orders"
                className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                View all
              </Link>
            )}
            <button
              type="button"
              onClick={() => setDesktopOpen((v) => !v)}
              aria-expanded={desktopOpen}
              aria-label={desktopOpen ? 'Collapse pending shipments' : 'Expand pending shipments'}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              {chevron(desktopOpen)}
            </button>
          </div>
        </div>

        {desktopOpen && list}
      </div>
    </>
  )
}
