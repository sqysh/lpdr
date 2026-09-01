import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { IProduct } from 'types/_product'
import { fadeUp } from 'lib/constants/motion.constants'
import { formatMoney } from 'lib/utils/currency.utils'
import Picture from 'components/_common/Picture'
import { useCartStore } from 'stores/cart.store'
import { useModalsStore } from 'stores/modals.store'

export function ProductCard({ product, index }: { product: IProduct; index: number }) {
  const [added, setAdded] = useState(false)
  const cartItems = useCartStore((s) => s.items)
  const addToCart = useCartStore((s) => s.addToCart)
  const showCartToast = useModalsStore((s) => s.showCartToast)

  const outOfStock = product?.countInStock === 0
  const inCart = cartItems.find((i) => i.id === product.id)?.quantity ?? 0

  const stockForSelection = product?.countInStock ?? 99

  const remaining = Math.max(0, stockForSelection - inCart)

  const atCartLimit = !outOfStock && remaining === 0
  const canAdd = !outOfStock && !atCartLimit

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (outOfStock || !canAdd || added) return

    const cartItem = {
      id: product.id,
      name: product.name ?? '',
      image: product.images?.[0] ?? null,
      price: product.price,
      quantity: 1,
      isPhysicalProduct: true,
      shippingPrice: product.shippingPrice
    }

    addToCart(cartItem)
    showCartToast(cartItem)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={index}
      className="flex flex-col bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark overflow-hidden"
      aria-label={product.name ?? 'Product'}
    >
      {/* ── Image ── */}
      <Link
        href={`/merch/${product.id}`}
        aria-label={`View details for ${product.name}`}
        className="block relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark group"
        tabIndex={0}
      >
        {product.images?.[0] ? (
          <Picture
            src={product.images[0]}
            alt={product.name ?? 'Product image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            priority={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag
              className="w-8 h-8 text-muted-light/30 dark:text-muted-dark/30"
              aria-hidden="true"
            />
          </div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-bg-light/70 dark:bg-bg-dark/70 flex items-center justify-center">
            <span className="px-3 py-1 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Out of stock
            </span>
          </div>
        )}

        {/* Hover cue */}
        {!outOfStock && (
          <div
            className="absolute inset-0 bg-primary-light/0 group-hover:bg-primary-light/5 dark:group-hover:bg-primary-dark/5 transition-colors duration-300"
            aria-hidden="true"
          />
        )}
      </Link>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/merch/${product.id}`}
            className="focus:outline-none focus-visible:underline"
            tabIndex={-1}
            aria-hidden="true"
          >
            <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug line-clamp-2">
              {product.name}
            </p>
          </Link>
          {product.description && (
            <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* ── View details ── */}
        <Link
          href={`/merch/${product.id}`}
          aria-label={`View full details for ${product.name}`}
          className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline"
        >
          View Details →
        </Link>

        {/* ── Price + Add ── */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-light dark:border-border-dark">
          <div>
            <span className="font-quicksand font-black text-base text-primary-light dark:text-primary-dark tabular-nums">
              {formatMoney(product.price)}
            </span>
            {product.shippingPrice > 0 && (
              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                +{formatMoney(product.shippingPrice)} shipping
              </p>
            )}
          </div>

          {!product.sizes && (
            <div className="flex flex-col items-end gap-1">
              <motion.button
                type="button"
                onClick={handleAdd}
                disabled={outOfStock || !canAdd}
                aria-label={
                  outOfStock
                    ? `${product.name} is out of stock`
                    : !canAdd
                      ? `Maximum quantity in cart`
                      : added
                        ? `${product.name} added to cart`
                        : `Add ${product.name} to cart`
                }
                aria-disabled={outOfStock || !canAdd}
                whileHover={!outOfStock && !added && canAdd ? { scale: 1.04 } : {}}
                whileTap={!outOfStock && !added && canAdd ? { scale: 0.96 } : {}}
                className={`shrink-0 w-9 h-9 flex items-center justify-center border-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
        ${
          outOfStock || !canAdd
            ? 'border-border-light dark:border-border-dark cursor-not-allowed opacity-40'
            : added
              ? 'border-primary-light dark:border-primary-dark bg-primary-light dark:bg-primary-dark'
              : 'border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark'
        }`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="w-4 h-4 text-white" aria-hidden="true" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="plus"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Plus
                        className="w-4 h-4 text-muted-light dark:text-muted-dark"
                        aria-hidden="true"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {!canAdd && !outOfStock && (
                <p className="text-[9px] font-mono text-amber-500 dark:text-amber-400 text-right">
                  Max {remaining === 0 ? 'reached' : `${remaining} left`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}
