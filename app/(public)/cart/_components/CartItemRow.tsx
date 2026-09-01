import { fadeUp } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import Picture from 'components/_common/Picture'
import { CartItem, useCartStore } from 'stores/cart.store'

export function CartItemRow({ item, index }: { item: CartItem; index: number }) {
  const removeFromCart = useCartStore((s) => s.removeFromCart)
  const incrementQuantity = useCartStore((s) => s.incrementQuantity)
  const decrementQuantity = useCartStore((s) => s.decrementQuantity)

  return (
    <motion.li
      layout
      variants={fadeUp}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
      custom={index}
      className="grid grid-cols-[auto_1fr_auto] gap-4 sm:gap-5 p-4 sm:p-5 bg-bg-light dark:bg-bg-dark"
    >
      {/* Image */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        {item.image ? (
          <Picture
            priority={true}
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag
              size={18}
              className="text-muted-light dark:text-muted-dark"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex flex-col justify-between gap-2">
        <div>
          <p className="font-quicksand font-black text-sm sm:text-base text-text-light dark:text-text-dark leading-snug truncate">
            {item.name}
          </p>
          {item.size && (
            <p className="text-[10px] font-mono uppercase tracking-wide text-muted-light dark:text-muted-dark mt-0.5">
              Size {item.size}
            </p>
          )}
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
            {item.isPhysicalProduct
              ? 'Ships to your address'
              : 'Donated directly to a dachshund in our care'}
          </p>
        </div>

        {/* Quantity controls */}
        <div
          className="flex items-center gap-0 border border-border-light dark:border-border-dark w-fit"
          role="group"
          aria-label={`Quantity for ${item.name}${item.size ? `, size ${item.size}` : ''}`}
        >
          <button
            onClick={() => decrementQuantity({ id: item.id, size: item.size })}
            aria-label={`Decrease quantity of ${item.name}`}
            disabled={item.quantity <= 1}
            className="w-8 h-8 flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark border-r border-border-light dark:border-border-dark"
          >
            <Minus size={11} aria-hidden="true" />
          </button>
          <span
            className="w-8 h-8 flex items-center justify-center text-xs font-mono text-text-light dark:text-text-dark"
            aria-live="polite"
            aria-atomic="true"
          >
            {item.quantity}
          </span>
          <button
            onClick={() => incrementQuantity({ id: item.id, size: item.size })}
            aria-label={`Increase quantity of ${item.name}`}
            disabled={item.maxQuantity != null && item.quantity >= item.maxQuantity}
            className="w-8 h-8 flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark border-l border-border-light dark:border-border-dark"
          >
            <Plus size={11} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Price + remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeFromCart({ id: item.id, size: item.size })}
          aria-label={`Remove ${item.name} from cart`}
          className="p-1 text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <X size={14} aria-hidden="true" />
        </button>
        <p className="font-quicksand font-black text-sm sm:text-base text-text-light dark:text-text-dark">
          {formatMoney(item.price * item.quantity)}
        </p>
      </div>
    </motion.li>
  )
}
