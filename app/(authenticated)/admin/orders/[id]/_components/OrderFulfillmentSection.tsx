'use client'

import { Truck, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderShippingStatus } from 'lib/actions/admin/order/updateOrderShippingStatus'
import { SerializedOrder } from 'types/_order.types'
import { StatusMessage } from 'components/_primitives/StatusMessage'
import { useStatusMessage } from 'lib/hooks/useStatusMessage.hook'
import { Label } from './OrderLabel'

const shipButton =
  'w-full py-3 font-mono font-black text-[10px] tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center justify-center gap-2'

const shippedPill =
  'inline-flex items-center gap-2 px-3 py-2 border border-emerald-500/40 bg-emerald-500/5 text-[10px] font-mono tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400'

export function OrderFulfillmentSection({ order }: { order: SerializedOrder }) {
  const router = useRouter()
  const [shipLoading, setShipLoading] = useState(false)
  const [shippedLocally, setShippedLocally] = useState(false)
  const { status, flash, clear } = useStatusMessage()

  const address = [order.addressLine1, order.addressLine2, order.city, order.state]
    .filter(Boolean)
    .join(', ')
  const isShipped = order.shippingStatus === 'SHIPPED' || shippedLocally

  const handleMarkShipped = async () => {
    setShipLoading(true)
    clear()

    const result = await updateOrderShippingStatus({ id: order.id, shippingStatus: 'SHIPPED' })

    setShipLoading(false)

    if (!result.success) {
      flash({
        tone: 'error',
        message: 'Could not mark this order as shipped',
        description: result.error ?? 'Something went wrong. Please try again.'
      })
      return
    }

    setShippedLocally(true)
    router.refresh()
  }

  return (
    <section
      aria-labelledby="fulfillment-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
        <h2
          id="fulfillment-heading"
          className="flex items-center gap-2 font-quicksand font-black text-sm text-text-light dark:text-text-dark"
        >
          <Truck className="w-4 h-4 text-primary-light dark:text-primary-dark" aria-hidden="true" />
          Fulfillment
        </h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div>
          <Label>Ships to</Label>
          <p className="text-xs font-mono text-text-light dark:text-text-dark mt-1">
            {address || '—'} {order.zipPostalCode ?? ''}
          </p>
        </div>

        <StatusMessage status={status} />

        {isShipped ? (
          <p className={shippedPill}>
            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Shipped
          </p>
        ) : (
          <button
            type="button"
            onClick={handleMarkShipped}
            disabled={shipLoading}
            className={shipButton}
          >
            {shipLoading ? (
              <span className="flex items-center gap-2" aria-live="polite">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="block w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full"
                  aria-hidden="true"
                />
                Marking...
              </span>
            ) : (
              <>
                <Truck className="w-3.5 h-3.5" aria-hidden="true" />
                Mark as Shipped
              </>
            )}
          </button>
        )}
      </div>
    </section>
  )
}
