'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { fadeUp } from 'lib/constants/motion.constants'
import { formatMoney } from 'app/utils/_currency.utils'
import { useAppDispatch, useCartSelector } from 'lib/store/store'
import { CartItem, clearCart } from 'lib/store/slices/cartSlice'
import { CartItemRow } from 'app/(public)/cart/_components/CartItemRow'
import { useRouter } from 'next/navigation'

export default function CartClient() {
  const { items } = useCartSelector()
  const dispatch = useAppDispatch()
  const router = useRouter()

  const subtotal = items.reduce(
    (s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity,
    0
  )
  const shipping = items
    .filter((i: { isPhysicalProduct: boolean }) => i.isPhysicalProduct)
    .reduce(
      (sum: number, i: { shippingPrice: number; quantity: number }) =>
        sum + i.shippingPrice * i.quantity,
      0
    )
  const total = subtotal + shipping
  const itemCount = items.reduce((s: any, i: { quantity: number }) => s + i.quantity, 0)
  const isEmpty = items?.length === 0
  const isFeedAFosterMonth = new Date().getMonth() === 6 // 0-indexed: 6 = July

  return (
    <main
      id="main-content"
      className="min-h-200 bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-10 sm:mb-12"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="square"
              aria-hidden="true"
            >
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            Continue Shopping
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Your Cart
            </p>
          </div>
          <h1 className="font-quicksand font-black text-3xl sm:text-4xl text-text-light dark:text-text-dark leading-tight">
            {isEmpty ? (
              'Your cart is empty'
            ) : (
              <>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </>
            )}
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* ── Empty state ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24 border border-dashed border-border-light dark:border-border-dark text-center gap-5"
              role="status"
              aria-live="polite"
            >
              <div className="w-14 h-14 border border-border-light dark:border-border-dark flex items-center justify-center">
                <ShoppingBag
                  size={22}
                  className="text-muted-light dark:text-muted-dark"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="font-quicksand font-black text-lg text-text-light dark:text-text-dark mb-1">
                  Nothing here yet
                </p>
                <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                  Add some items from the store to get started.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/merch"
                  className="px-6 py-3 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono font-black tracking-[0.25em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  Browse Merch
                </Link>
                <Link
                  href="/welcomewieners"
                  className="px-6 py-3 border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-text-light dark:text-text-dark text-[10px] font-mono font-black tracking-[0.25em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  Welcome Wieners
                </Link>
                {isFeedAFosterMonth && (
                  <Link
                    href="/feed"
                    className="px-6 py-3 border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-text-light dark:text-text-dark text-[10px] font-mono font-black tracking-[0.25em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    Feed a Foster
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            /* ── Cart content ── */
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 1000:grid-cols-[1fr_320px] gap-6 sm:gap-8 items-start"
            >
              {/* Items list */}
              <div>
                <ul
                  className="flex flex-col gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
                  aria-label="Cart items"
                  role="list"
                >
                  <AnimatePresence>
                    {items.map((item: CartItem, i: number) => (
                      <CartItemRow key={`${item.id}-${item.size ?? ''}`} item={item} index={i} />
                    ))}
                  </AnimatePresence>
                </ul>

                {/* Clear cart */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <motion.aside
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                aria-label="Order summary"
                className="border border-border-light dark:border-border-dark sticky top-6"
              >
                {/* Summary header */}
                <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                  <div className="flex items-center gap-3">
                    <span
                      className="block w-4 h-px bg-primary-light dark:bg-primary-dark"
                      aria-hidden="true"
                    />
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                      Order Summary
                    </p>
                  </div>
                </div>

                {/* Line items */}
                <div className="px-5 py-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                      Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </p>
                    <p className="text-xs font-mono text-text-light dark:text-text-dark">
                      {formatMoney(subtotal)}
                    </p>
                  </div>

                  {shipping > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                        Shipping
                      </p>
                      <p className="text-xs font-mono text-text-light dark:text-text-dark">
                        {formatMoney(shipping)}
                      </p>
                    </div>
                  )}

                  {shipping === 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                        Shipping
                      </p>
                      <p className="text-[10px] font-mono text-green-600 dark:text-green-400">
                        Free
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono font-black text-text-light dark:text-text-dark">
                      Total
                    </p>
                    <p className="font-quicksand font-black text-xl text-primary-light dark:text-primary-dark">
                      {formatMoney(total)}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 flex flex-col gap-2">
                  <Link
                    href="/checkout"
                    className="w-full text-center py-3.5 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono font-black tracking-[0.25em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    aria-label={`Proceed to checkout — total ${formatMoney(total)}`}
                  >
                    Checkout
                  </Link>
                  <p className="text-[9px] font-mono text-center text-muted-light dark:text-muted-dark mt-1">
                    Proceeds support dachshund rescue
                  </p>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
