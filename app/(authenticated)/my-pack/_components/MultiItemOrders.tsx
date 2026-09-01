import { formatDate } from 'app/utils/_date.utils'
import { EmptyState } from './EmptyState'
import { StatusPill } from 'components/_primitives/StatusPill'
import { formatMoney } from 'app/utils/_currency.utils'
import Picture from 'components/_common/Picture'
import Link from 'next/link'
import { ITEM_ICONS } from 'lib/constants/feed-a-foster.constants'
import { Utensils } from 'lucide-react'

const ITEM_TYPE_LABELS: Record<string, string> = {
  PRODUCT: 'Merch',
  WELCOME_WIENER: 'Welcome Wiener',
  FEED_A_FOSTER: 'Feed a Foster',
  AUCTION_WINNING_BID: 'Auction',
  AUCTION_INSTANT_BUY: 'Auction'
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  ONE_TIME_DONATION: 'Donation',
  RECURRING_DONATION: 'Recurring Donation',
  ADOPTION_FEE: 'Adoption Fee',
  AUCTION_PURCHASE: 'Auction',
  ECARD: 'eCard'
}

function getOrderLabel(order) {
  if (order.type !== 'PURCHASE') {
    return ORDER_TYPE_LABELS[order.type] ?? order.type.replaceAll('_', ' ')
  }
  if (order.items.length === 1) {
    return ITEM_TYPE_LABELS[order.items[0].type] ?? 'Purchase'
  }
  return 'Multi-item order'
}

export function MultiItemOrders({ multiItemOrders }) {
  return (
    <section aria-labelledby="multi-item-heading">
      {multiItemOrders?.length === 0 ? (
        <EmptyState message="You haven't made any purchases yet." />
      ) : (
        <div className="divide-y divide-border-light dark:divide-border-dark">
          {multiItemOrders?.slice(0, 3).map((order) => (
            <div
              key={order.id}
              className={`p-4 sm:p-5 ${
                order.shippingStatus === 'SHIPPED'
                  ? 'border-l-2 border-l-green-500'
                  : order.shippingStatus
                    ? 'border-l-2 border-l-amber-400'
                    : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                      {formatDate(order.createdAt, true)}
                    </p>
                    {order.shippingStatus && (
                      <span
                        className={`text-[9px] font-mono tracking-[0.15em] uppercase ${
                          order.shippingStatus === 'SHIPPED'
                            ? 'text-green-500 dark:text-green-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        · {order.shippingStatus.replaceAll('_', ' ')}
                      </span>
                    )}
                    {order.customerName && (
                      <p className="text-xs font-mono text-text-light dark:text-text-dark mt-0.5">
                        {order.customerName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-mono tracking-[0.15em] uppercase px-2 py-0.5 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark">
                    {getOrderLabel(order)}
                  </span>
                  <StatusPill status={order.status} />
                  <span className="font-quicksand font-black text-sm text-primary-light dark:text-primary-dark tabular-nums">
                    {formatMoney(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items */}
              <ul className="space-y-2" role="list" aria-label="Order items">
                {order.items.map((item) => {
                  const Icon = item.iconKey ? (ITEM_ICONS[item.iconKey] ?? Utensils) : null
                  return (
                    <li key={item.id} className="flex items-center gap-3" role="listitem">
                      <div
                        className="shrink-0 w-8 h-8 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden"
                        aria-hidden="true"
                      >
                        {item.image ? (
                          <Picture
                            priority={false}
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : Icon ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-4 h-4 text-muted-light dark:text-muted-dark" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[9px] font-mono text-muted-light dark:text-muted-dark">
                              ?
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-text-light dark:text-text-dark truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-mono tracking-[0.15em] uppercase px-1.5 py-0.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark shrink-0">
                            {ITEM_TYPE_LABELS[item.itemType] ?? item.itemType.replaceAll('_', ' ')}
                          </span>
                          {item.quantity > 1 && (
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                              ×{item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-muted-light dark:text-muted-dark tabular-nums shrink-0">
                        {formatMoney(item.price * item.quantity)}
                      </span>
                    </li>
                  )
                })}
              </ul>

              {/* Shipping address */}
              {order.shippingAddress && order.type === 'PRODUCT' && (
                <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                  <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark shrink-0">
                    Ships to
                  </p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 &&
                      `, ${order.shippingAddress.addressLine2}`}
                    {', '}
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipPostalCode}
                  </p>
                </div>
              )}

              {/* View confirmation */}
              <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                <Link
                  href={`/order-confirmation/${order.id}?ref=?tab=orders`}
                  aria-label={`View order confirmation for ${formatDate(order.createdAt)}`}
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline"
                >
                  View confirmation →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {multiItemOrders?.length > 5 && (
        <div className="mt-4">
          <Link
            href="/my-pack/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-border-light dark:border-border-dark text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            View all {multiItemOrders?.length} orders →
          </Link>
        </div>
      )}
    </section>
  )
}
