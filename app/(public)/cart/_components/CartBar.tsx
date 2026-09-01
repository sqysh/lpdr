'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Picture from 'components/_common/Picture'
import { useCartStore } from 'stores/cart.store'

export function CartBar() {
  const items = useCartStore((s) => s.items)
  const removeFromCart = useCartStore((s) => s.removeFromCart)
  const clearCart = useCartStore((s) => s.clearCart)
  const pathname = usePathname()
  const isWienerPage = pathname === '/welcomewieners' || pathname.startsWith('/welcomewieners/')

  const [expanded, setExpanded] = useState(false)
  const isExpanded = expanded && items.length > 0

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!isWienerPage) return null

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-60"
            onClick={() => setExpanded(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-70"
        role="region"
        aria-label="Shopping cart"
        aria-live="polite"
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="items"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden bg-bg-light dark:bg-bg-dark border-t border-x border-border-light dark:border-border-dark max-w-lg mx-auto"
            >
              {/* Item list */}
              <ul
                className="divide-y divide-border-light dark:divide-border-dark max-h-56 overflow-y-auto"
                role="list"
                aria-label="Cart items"
              >
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3" role="listitem">
                    {/* Image */}
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
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-3 h-3 text-muted-light dark:text-muted-dark" />
                        </div>
                      )}
                    </div>

                    {/* Name + qty */}
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

                    {/* Price */}
                    <span className="text-[11px] font-mono text-primary-light dark:text-primary-dark tabular-nums shrink-0">
                      ${item.price * item.quantity}
                    </span>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeFromCart({ id: item.id, size: item.size })}
                      aria-label={`Remove ${item.name} from cart`}
                      className="shrink-0 text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark p-1"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Clear all */}
              <div className="px-4 py-2.5 border-t border-border-light dark:border-border-dark flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:underline"
                >
                  Clear cart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main bar */}
        <div className="bg-bg-light dark:bg-bg-dark border-t border-border-light dark:border-border-dark">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            {/* Toggle items */}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={isExpanded}
              aria-controls="cart-items-list"
              aria-label={`${isExpanded ? 'Hide' : 'Show'} cart items — ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
              className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <div className="relative" aria-hidden="true">
                <ShoppingBag className="w-4 h-4 text-text-light dark:text-text-dark" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-white text-[9px] font-mono font-bold">
                  {totalItems}
                </span>
              </div>
              <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            </button>

            {/* Spacer */}
            <div className="flex-1" aria-hidden="true" />

            {/* Total */}
            <span className="font-quicksand font-black text-lg text-text-light dark:text-text-dark tabular-nums">
              ${totalPrice}
            </span>

            {/* Checkout */}
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Checkout
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
