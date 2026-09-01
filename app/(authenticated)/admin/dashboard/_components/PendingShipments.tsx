import { formatMoney } from 'app/utils/_currency.utils'
import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { Truck } from 'lucide-react'
import Link from 'next/link'

export function PendingShipments({ data }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={1}
      className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark mb-5"
    >
      <div className="px-5 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500">
            Needs Shipping · {data.pendingShipments.length}{' '}
            {data.pendingShipments.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-border-light dark:divide-border-dark">
        {data.pendingShipments.map((shipment) => (
          <div key={shipment.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
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
    </motion.section>
  )
}
