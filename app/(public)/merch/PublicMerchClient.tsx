'use client'

import { motion } from 'framer-motion'
import { IProduct } from 'types/_product'
import { fadeUp } from 'lib/constants/motion.constants'
import { ProductCard } from 'app/(public)/merch/_components/ProductCard'

export default function PublicMerchClient({ products }: { products: IProduct[] }) {
  const inStock = products.filter((p) => p.countInStock > 0)
  const outOfStock = products.filter((p) => p.countInStock === 0)
  const sorted = [...inStock, ...outOfStock]

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
              LPDR Store
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark leading-tight mb-3">
            Merch &amp;{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">Goods</span>
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark max-w-md leading-relaxed">
            Every purchase supports our rescue efforts. Proceeds go directly to the care of our
            dachshunds.
          </p>
        </motion.div>

        {/* ── Count ── */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-6"
          aria-live="polite"
        >
          {inStock.length} item{inStock.length !== 1 ? 's' : ''} available
          {outOfStock.length > 0 && (
            <span className="ml-2 opacity-50">· {outOfStock.length} out of stock</span>
          )}
        </motion.p>

        {/* ── Grid ── */}
        {sorted.length > 0 ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
            role="list"
            aria-label="Products"
          >
            {sorted.map((product, i) => (
              <div key={product.id} role="listitem">
                <ProductCard product={product} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="py-24 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-mono text-muted-light dark:text-muted-dark">
              No products available right now. Check back soon.
            </p>
          </motion.div>
        )}
      </div>
    </main>
  )
}
