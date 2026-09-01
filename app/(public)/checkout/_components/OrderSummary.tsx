import Picture from 'components/_common/Picture'
import { ITEM_ICONS } from 'lib/constants/feed-a-foster.constants'
import { Utensils } from 'lucide-react'
import { CartItem } from 'stores/cart.store'

interface IOrderSummary {
  items: CartItem[]
  finalAmount: number
  total: number
  coverFees: boolean
  step: number
  shipping: number
}

export function OrderSummary({
  items,
  finalAmount,
  total,
  coverFees,
  step,
  shipping
}: IOrderSummary) {
  return (
    <aside aria-label="Order summary" className="lg:sticky lg:top-8">
      <div className="border border-border-light dark:border-border-dark">
        <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            Order Summary
          </p>
        </div>

        <ul
          className="divide-y divide-border-light dark:divide-border-dark"
          role="list"
          aria-label="Cart items"
        >
          {items.map((item) => {
            const ItemIcon = item.iconKey ? (ITEM_ICONS[item.iconKey] ?? Utensils) : null

            return (
              <li
                key={`${item.id}-${item.size ?? ''}`}
                className="flex items-center gap-3 px-5 py-3.5"
                role="listitem"
              >
                <div
                  className="shrink-0 w-8 h-8 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className="shrink-0 w-8 h-8 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden"
                    aria-hidden="true"
                  >
                    {item.image ? (
                      <Picture
                        priority={true}
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : ItemIcon ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <ItemIcon className="w-4 h-4 text-muted-light dark:text-muted-dark" />
                      </div>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-text-light dark:text-text-dark truncate">
                    {item.name}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                      ×{item.quantity}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-mono text-primary-light dark:text-primary-dark tabular-nums shrink-0">
                  ${item.price * item.quantity}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="px-5 py-4 border-t border-border-light dark:border-border-dark space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Subtotal
            </span>
            <span className="text-[11px] font-mono text-muted-light dark:text-muted-dark tabular-nums">
              ${total.toFixed(2)}
            </span>
          </div>

          {shipping > 0 ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Shipping
              </span>
              <span className="text-[11px] font-mono text-muted-light dark:text-muted-dark tabular-nums">
                +${shipping.toFixed(2)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Shipping
              </span>
              <span className="text-[11px] font-mono text-primary-light dark:text-primary-dark tabular-nums">
                Digital Donation
              </span>
            </div>
          )}

          {coverFees && step === 4 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Processing fees
              </span>
              <span className="text-[11px] font-mono text-muted-light dark:text-muted-dark tabular-nums">
                +${(finalAmount - total - shipping).toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-border-light dark:border-border-dark flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Total
            </span>
            <span className="font-quicksand font-black text-xl text-primary-light dark:text-primary-dark tabular-nums">
              ${coverFees && step === 4 ? finalAmount.toFixed(2) : (total + shipping).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
