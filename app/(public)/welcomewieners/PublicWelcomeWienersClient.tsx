'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IWelcomeWiener, WelcomeWienerProduct } from 'types/welcome-wiener'
import { fadeUp } from 'lib/constants/motion.constants'
import { WelcomeWienerCard } from 'app/(public)/welcomewieners/_components/WelcomeWienerCard'
import { useCartStore } from 'stores/cart.store'
import { useModalsStore } from 'stores/modals.store'

// There are only ever a few dogs at a time, so the columns match the count rather than leaving gaps
const GRID_COLS: Record<number, string> = {
  1: 'max-w-xl',
  2: 'sm:grid-cols-2'
}

export function PublicWelcomeWienersClient({ welcomeWieners }: { welcomeWieners: IWelcomeWiener[] }) {
  const addToCart = useCartStore((s) => s.addToCart)
  const showCartToast = useModalsStore((s) => s.showCartToast)
  const [added, setAdded] = useState<Record<string, string[]>>({})

  const handleAdd = (dog: IWelcomeWiener, product: WelcomeWienerProduct) => {
    if (added[dog.id]?.includes(product.id)) return
    const cartItem = {
      id: `${dog.id}-${product.id}`,
      welcomeWienerId: dog.id,
      welcomeWienerProductId: product.id,
      name: `${product.name} for ${dog.name}`,
      image: dog.images[0] ?? null,
      price: product.price,
      quantity: 1,
      isPhysicalProduct: false,
      type: 'WELCOME_WIENER'
    }
    addToCart(cartItem)
    showCartToast(cartItem)
    setAdded((prev) => ({ ...prev, [dog.id]: [...(prev[dog.id] ?? []), product.id] }))
    setTimeout(() => setAdded((prev) => ({ ...prev, [dog.id]: prev[dog.id].filter((id) => id !== product.id) })), 2000)
  }

  const count = welcomeWieners.length

  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
            <p className="text-xs font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">Welcome Wieners</p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark leading-tight mb-3">
            Meet the <span className="font-light text-muted-light dark:text-muted-dark">Dogs</span>
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark max-w-md leading-relaxed">
            {count
              ? "These dogs are in our care and need your support. Pick an item from any dog's list to donate it directly."
              : 'All of our Welcome Wieners have found homes. Check back soon to meet the next ones.'}
          </p>
        </motion.div>

        {count > 0 && (
          <motion.ul
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            role="list"
            aria-label="Welcome Wiener dogs"
            className={`grid grid-cols-1 gap-4 sm:gap-6 items-start ${GRID_COLS[count] ?? 'sm:grid-cols-2 lg:grid-cols-3'}`}
          >
            {welcomeWieners.map((dog, i) => (
              <li key={dog.id}>
                <WelcomeWienerCard dog={dog} index={i} onAddProduct={handleAdd} />
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </main>
  )
}
