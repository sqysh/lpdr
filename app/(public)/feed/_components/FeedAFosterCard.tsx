import { fadeUp } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Check, Utensils } from 'lucide-react'
import { ITEM_ICONS } from 'lib/constants/feed-a-foster.constants'
import { useCartStore } from 'stores/cart.store'
import { useModalsStore } from 'stores/modals.store'

type Props = {
  i: number
  item: { id: string; title: string; amount: number; textKey: string }
  isAvailable: boolean
}

export function FeedAFosterCard({ i, item, isAvailable }: Props) {
  const addToCart = useCartStore((s) => s.addToCart)
  const showCartToast = useModalsStore((s) => s.showCartToast)

  const [added, setAdded] = useState(false)
  const Icon = ITEM_ICONS[item.id] ?? Utensils

  const handleAdd = () => {
    const cartItem = {
      id: item.id,
      name: `${item.title} - Feed a Foster`,
      price: item.amount,
      quantity: 1,
      isPhysicalProduct: false,
      type: 'FEED_A_FOSTER' as const,
      iconKey: item.id,
      feedAFosterId: item.id
    }

    addToCart(cartItem)
    showCartToast(cartItem)

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.li
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      custom={i}
      className="group bg-bg-light dark:bg-bg-dark flex flex-col border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors duration-300"
    >
      {/* Graphic header — replaces the image */}
      <div className="relative aspect-3/2 overflow-hidden bg-surface-light dark:bg-surface-dark flex items-center justify-center border-b border-border-light dark:border-border-dark">
        {/* Subtle index watermark */}
        <span
          className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light/50 dark:text-muted-dark/50"
          aria-hidden="true"
        >
          {String(i + 1).padStart(2, '0')}
        </span>

        {/* Icon */}
        <Icon
          className="w-14 h-14 sm:w-16 sm:h-16 text-primary-light dark:text-primary-dark transition-transform duration-500 group-hover:scale-110"
          strokeWidth={1.25}
          aria-hidden="true"
        />

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-primary-light dark:bg-primary-dark text-white font-mono text-sm font-bold px-3 py-1">
          ${item.amount}
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 p-5 sm:p-6 gap-4 ${!isAvailable ? 'opacity-50' : ''}`}>
        <div>
          <h2 className="font-quicksand text-lg font-bold text-text-light dark:text-text-dark mb-2">
            {item.title}
          </h2>
          <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
            {item.textKey}
          </p>
        </div>

        <div className="mt-auto pt-2">
          {isAvailable ? (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Donate $${item.amount} for ${item.title}`}
              className={`w-full flex items-center justify-center gap-2 text-center font-semibold text-sm py-3 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                added
                  ? 'bg-primary-light dark:bg-primary-dark text-white'
                  : 'bg-button-light dark:bg-button-dark hover:bg-primary-light dark:hover:bg-primary-dark text-white'
              }`}
            >
              {added ? (
                <>
                  <Check size={16} aria-hidden="true" />
                  Added to cart
                </>
              ) : (
                `Donate $${item.amount}`
              )}
            </button>
          ) : (
            <div
              aria-disabled="true"
              role="button"
              aria-label={`Donations for ${item.title} open in July`}
              className="block w-full text-center bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark font-semibold text-sm py-3 px-6 cursor-not-allowed select-none"
            >
              Opens in July
            </div>
          )}
        </div>
      </div>
    </motion.li>
  )
}
