'use client'

import { IOrder } from 'types/order.types'
import { Package, Heart } from 'lucide-react'
import Image from 'next/image'
import { formatMoney } from 'lib/utils/currency.utils'

export function OrderItemsSection({ order }: { order: IOrder }) {
  const subtotal = Number(order.subtotal)
  const shipping = Number(order.shipping)
  const feesCovered = Number(order.feesCovered)
  const total = Number(order.totalAmount)

  // What the rescue actually keeps: the donor covering the fee is the
  // difference between netting the full amount and absorbing the cost
  const netToRescue = order.coverFees ? subtotal + shipping : subtotal + shipping - feesCovered

  return (
    <section
      aria-labelledby="order-items-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
        <h2 id="order-items-heading" className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
          Items
        </h2>
        <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <ul className="divide-y divide-border-light dark:divide-border-dark">
        {order.items.map((item) => {
          const quantity = item.quantity ?? 1
          const unitPrice = Number(item.price)
          const lineTotal = Number(unitPrice * quantity)

          return (
            <li key={item.id} className="flex items-start gap-4 px-4 py-3">
              <div className="shrink-0 w-12 h-12 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark overflow-hidden relative">
                {item.itemImage ? (
                  <Image src={item.itemImage} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
                    {item.isPhysical ? (
                      <Package className="w-4 h-4 text-muted-light dark:text-muted-dark" />
                    ) : (
                      <Heart className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                    )}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-nunito text-text-light dark:text-text-dark truncate">{item.itemName ?? 'Unnamed item'}</p>
                  {!item.isPhysical && (
                    <span className="shrink-0 px-1.5 py-0.5 border border-primary-light/30 dark:border-primary-dark/30 text-[8px] font-mono tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark">
                      Donation
                    </span>
                  )}
                </div>

                {/* One fact per cell, so the numbers can be scanned rather than read */}
                <dl className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-[10px] font-mono text-muted-light dark:text-muted-dark">
                  <div className="flex gap-1">
                    <dt className="uppercase tracking-[0.15em]">Unit</dt>
                    <dd className="tabular-nums text-text-light dark:text-text-dark">{formatMoney(unitPrice)}</dd>
                  </div>

                  <div className="flex gap-1">
                    <dt className="uppercase tracking-[0.15em]">Qty</dt>
                    <dd className="tabular-nums text-text-light dark:text-text-dark">{quantity}</dd>
                  </div>

                  {item.size && (
                    <div className="flex gap-1">
                      <dt className="uppercase tracking-[0.15em]">Size</dt>
                      <dd className="text-text-light dark:text-text-dark">{item.size}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <p className="shrink-0 text-sm font-mono tabular-nums text-text-light dark:text-text-dark">{formatMoney(lineTotal)}</p>
            </li>
          )
        })}
      </ul>

      {/* ── Totals ── */}
      <dl className="border-t border-border-light dark:border-border-dark px-4 py-3 space-y-1.5">
        <div className="flex justify-between text-xs font-mono">
          <dt className="text-muted-light dark:text-muted-dark">Subtotal</dt>
          <dd className="tabular-nums text-text-light dark:text-text-dark">{formatMoney(subtotal)}</dd>
        </div>

        {shipping > 0 && (
          <div className="flex justify-between text-xs font-mono">
            <dt className="text-muted-light dark:text-muted-dark">Shipping</dt>
            <dd className="tabular-nums text-text-light dark:text-text-dark">{formatMoney(shipping)}</dd>
          </div>
        )}

        <div className="flex justify-between text-xs font-mono">
          <dt className="text-muted-light dark:text-muted-dark">
            Processing fee
            <span
              className={`ml-1.5 text-[9px] tracking-[0.15em] uppercase ${
                order.coverFees ? 'text-emerald-500' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {order.coverFees ? 'covered' : 'absorbed'}
            </span>
          </dt>
          <dd className="tabular-nums text-text-light dark:text-text-dark">
            {order.coverFees ? `+${formatMoney(feesCovered)}` : formatMoney(feesCovered)}
          </dd>
        </div>

        <div className="flex justify-between pt-2 mt-1 border-t border-border-light dark:border-border-dark">
          <dt className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">Charged</dt>
          <dd className="text-sm font-mono font-black tabular-nums text-text-light dark:text-text-dark">{formatMoney(total)}</dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">Net to rescue</dt>
          <dd className="text-sm font-mono font-black tabular-nums text-primary-light dark:text-primary-dark">
            {formatMoney(netToRescue)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
