import Image from 'next/image'
import Link from 'next/link'
import { Package, Heart, ChevronRight } from 'lucide-react'
import { SerializedOrder } from 'types/_order.types'
import { Label } from './OrderLabel'

function money(n: number) {
  return `$${n.toFixed(2)}`
}

const DONATION_TYPES = new Set([
  'ONE_TIME_DONATION',
  'RECURRING_DONATION',
  'ADOPTION_FEE',
  'FEED_A_FOSTER'
])

const TYPE_LABELS: Record<string, string> = {
  ONE_TIME_DONATION: 'One-time donation',
  RECURRING_DONATION: 'Recurring donation',
  ADOPTION_FEE: 'Adoption fee',
  FEED_A_FOSTER: 'Feed a Foster'
}

export function OrderItemsSection({ order }: { order: SerializedOrder }) {
  const typeLabel = TYPE_LABELS[order.type] ?? order.type.replaceAll('_', ' ')

  return (
    <section
      aria-labelledby="items-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light dark:border-border-dark">
        <h2
          id="items-heading"
          className="flex items-center gap-2 font-quicksand font-black text-sm text-text-light dark:text-text-dark"
        >
          <Package
            className="w-4 h-4 text-primary-light dark:text-primary-dark"
            aria-hidden="true"
          />
          {order.items.length === 0 ? 'Donation' : 'Items'}
        </h2>
        {order.items.length > 0 && (
          <Label>
            {order.items.length} line{order.items.length === 1 ? '' : 's'}
          </Label>
        )}
      </div>

      {DONATION_TYPES.has(order.type) ? (
        <div className="px-4 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-10 h-10 flex items-center justify-center border border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/10 dark:bg-primary-dark/10">
              <Heart
                className="w-4 h-4 text-primary-light dark:text-primary-dark"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-sm font-nunito text-text-light dark:text-text-dark">{typeLabel}</p>
              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                {order.type.replaceAll('_', ' ')}
                {order.isRecurring && order.recurringFrequency && ` · ${order.recurringFrequency}`}
                {order.tierName && ` · ${order.tierName}`}
              </p>
            </div>
          </div>

          <dl className="space-y-1.5 border-t border-border-light dark:border-border-dark pt-3">
            <div className="flex justify-between">
              <dt className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                Donation
              </dt>
              <dd className="text-xs font-mono tabular-nums text-text-light dark:text-text-dark">
                {money(order.totalAmount - order.feesCovered)}
              </dd>
            </div>
            {order.coverFees && (
              <div className="flex justify-between">
                <dt className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                  Fees covered by donor
                </dt>
                <dd className="text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  +{money(order.feesCovered)}
                </dd>
              </div>
            )}
            {order.isRecurring && order.nextBillingDate && (
              <div className="flex justify-between">
                <dt className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                  Next billing
                </dt>
                <dd className="text-xs font-mono tabular-nums text-text-light dark:text-text-dark">
                  {new Date(order.nextBillingDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </dd>
              </div>
            )}
            <div className="flex justify-between pt-1.5 border-t border-border-light dark:border-border-dark">
              <dt className="text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-text-light dark:text-text-dark">
                Total charged
              </dt>
              <dd className="text-sm font-mono font-bold tabular-nums text-primary-light dark:text-primary-dark">
                {money(order.totalAmount)}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <ul className="divide-y divide-border-light dark:divide-border-dark">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-4 py-3">
              <div className="shrink-0 w-12 h-12 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark overflow-hidden relative">
                {item.itemImage ? (
                  <Image src={item.itemImage} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    aria-hidden="true"
                  >
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
                  <p className="text-sm font-nunito text-text-light dark:text-text-dark truncate">
                    {item.itemName ?? 'Unnamed item'}
                  </p>
                  {!item.isPhysical && (
                    <span className="shrink-0 px-1.5 py-0.5 border border-primary-light/30 dark:border-primary-dark/30 text-[8px] font-mono tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark">
                      Donation
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                  {item.isPhysical ? (
                    <>
                      {item.size && <>Size {item.size} · </>}
                      Qty {item.quantity ?? 1} · {money(item.price)} each
                      {item.shippingPrice > 0 && <> · +{money(item.shippingPrice)} shipping</>}
                    </>
                  ) : (
                    <>
                      {(item.quantity ?? 1) > 1
                        ? `${item.quantity} × ${money(item.price)}`
                        : money(item.price)}{' '}
                      · no shipping
                    </>
                  )}
                </p>
                {item.welcomeWienerId && (
                  <Link
                    href={`/admin/welcome-wieners/${item.welcomeWienerId}`}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-primary-light dark:text-primary-dark hover:underline mt-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    View wiener
                    <ChevronRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <p className="shrink-0 text-sm font-mono tabular-nums text-text-light dark:text-text-dark">
                {money(item.totalPrice ?? item.price * (item.quantity ?? 1))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
