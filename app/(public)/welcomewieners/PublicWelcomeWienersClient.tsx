'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IWelcomeWiener, WelcomeWienerProduct } from 'types/welcome-wiener'
import { fadeUp } from 'lib/constants/motion.constants'
import { FILTERS, FilterValue } from 'lib/constants/welcome-wiener.constants'
import { WelcomeWienerCard } from 'app/(public)/welcomewieners/_components/WelcomeWienerCard'
import { useCartStore } from 'stores/cart.store'
import { useModalsStore } from 'stores/modals.store'

export function PublicWelcomeWienersClient({
  welcomeWieners
}: {
  welcomeWieners: IWelcomeWiener[]
}) {
  const addToCart = useCartStore((s) => s.addToCart)
  const showCartToast = useModalsStore((s) => s.showCartToast)
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all')
  const [added, setAdded] = useState<Record<string, string[]>>({})

  const filtered = welcomeWieners.filter((d) => {
    if (activeFilter === 'all') return true
    return d.associatedProducts.some((p) => p.category === activeFilter)
  })

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: welcomeWieners?.length ?? 0 }
    for (const f of FILTERS) {
      if (f.value === 'all') continue
      base[f.value] = welcomeWieners.filter((d) =>
        (d.associatedProducts as WelcomeWienerProduct[]).some((p) => p.category === f.value)
      ).length
    }
    return base
  }, [welcomeWieners])

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
    setTimeout(
      () =>
        setAdded((prev) => ({ ...prev, [dog.id]: prev[dog.id].filter((id) => id !== product.id) })),
      2000
    )
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-10 sm:mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Welcome Wieners
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark leading-tight mb-3">
            Meet the <span className="font-light text-muted-light dark:text-muted-dark">Dogs</span>
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark max-w-md leading-relaxed">
            These dogs are in our care and need your support. Pick an item from any dog&apos;s list
            to donate it directly.
          </p>
        </motion.div>

        {/* ── Filters ── */}
        <motion.nav
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          aria-label="Filter dogs"
          className="mb-8"
        >
          <ul className="flex items-center gap-2" role="list">
            {FILTERS.map((f) => (
              <li key={f.value}>
                <button
                  onClick={() => setActiveFilter(f.value)}
                  aria-pressed={activeFilter === f.value}
                  aria-label={`${f.label} (${counts[f.value]})`}
                  className={`px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                    ${
                      activeFilter === f.value
                        ? 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark'
                        : 'bg-transparent border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark'
                    }`}
                >
                  {f.label}
                  <span className="ml-2 opacity-60 tabular-nums">{counts[f.value]}</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.nav>

        {/* ── Grid ── */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              role="list"
              aria-label="Welcome Wiener dogs"
            >
              {filtered.map((dog, i) => (
                <div key={dog.id} role="listitem">
                  <WelcomeWienerCard dog={dog} index={i} onAddProduct={handleAdd} />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm font-mono text-muted-light dark:text-muted-dark">
                No dogs found.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
