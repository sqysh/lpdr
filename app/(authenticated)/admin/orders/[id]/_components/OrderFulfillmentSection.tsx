'use client'

import { Truck, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { store } from 'lib/store/store'
import { showToast } from 'lib/store/slices/toastSlice'
import { updateOrderShippingStatus } from 'lib/actions/admin/order/updateOrderShippingStatus'
import { SerializedOrder } from 'types/_order.types'
import { Label } from './OrderLabel'

export function OrderFulfillmentSection({ order }: { order: SerializedOrder }) {
  const [shipLoading, setShipLoading] = useState(false)
  const [shippedLocally, setShippedLocally] = useState(false)
  const router = useRouter()

  const address = [order.addressLine1, order.addressLine2, order.city, order.state]
    .filter(Boolean)
    .join(', ')
  const itemCount = order.items.reduce((s, i) => s + (i.quantity ?? 1), 0)
  const destination = [order.city, order.state].filter(Boolean).join(', ')
  const isShipped = order.shippingStatus === 'SHIPPED' || shippedLocally

  const handleMarkShipped = async () => {
    setShipLoading(true)
    try {
      const result = await updateOrderShippingStatus({ id: order.id, shippingStatus: 'SHIPPED' })
      if (!result.success) throw new Error(result.error ?? 'Failed to update')
      setShippedLocally(true)
      store.dispatch(
        showToast({
          type: 'success',
          message: `Order #${order.id.slice(-8)} marked as shipped`,
          description:
            [order.customerName, `${itemCount} item${itemCount === 1 ? '' : 's'}`, destination]
              .filter(Boolean)
              .join(' · ') || undefined,
          duration: 5000
        })
      )
      router.refresh()
    } catch (err) {
      store.dispatch(
        showToast({
          type: 'error',
          message: `Couldn't mark order #${order.id.slice(-8)} as shipped`,
          description:
            err instanceof Error ? err.message : 'Something went wrong — please try again',
          duration: 6000
        })
      )
    } finally {
      setShipLoading(false)
    }
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
        {isShipped ? (
          <p className="inline-flex items-center gap-2 px-3 py-2 border border-emerald-500/40 bg-emerald-500/5 text-[10px] font-mono tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Shipped
          </p>
        ) : (
          <button
            type="button"
            onClick={handleMarkShipped}
            disabled={shipLoading}
            className="w-full py-3 font-mono font-black text-[10px] tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center justify-center gap-2"
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
