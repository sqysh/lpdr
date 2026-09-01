'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Check, Share2 } from 'lucide-react'
import Link from 'next/link'
import { IWelcomeWiener, WelcomeWienerProduct } from 'types/_welcome-wiener'
import { fadeUp } from 'lib/constants/motion.constants'
import Picture from 'components/_common/Picture'
import { useAppDispatch } from 'lib/store/store'
import { addToCart } from 'lib/store/slices/cartSlice'
import { setOpenCartToast } from 'lib/store/slices/uiSlice'
import { WELCOME_WIENER_CATEGORY_LABELS } from 'lib/constants/welcome-wiener.constants'

export default function PublicWelcomeWienerClient({
  welcomeWiener
}: {
  welcomeWiener: IWelcomeWiener
}) {
  const dispatch = useAppDispatch()
  const [photoIndex, setPhotoIndex] = useState(0)
  const [added, setAdded] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [activeCategory, setActiveCategory] = useState<WelcomeWienerProduct['category'] | 'all'>(
    'all'
  )

  const allImages = [...(welcomeWiener.images ?? [])]

  const products = (welcomeWiener.associatedProducts ?? []) as WelcomeWienerProduct[]

  const categories = [
    ...new Set(products.map((p) => p.category))
  ] as WelcomeWienerProduct['category'][]

  const filteredProducts =
    activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory)

  const handleAddToCart = (product: WelcomeWienerProduct) => {
    if (added.includes(product.id)) return

    setAdded((prev) => [...prev, product.id])

    const cartItem = {
      id: product.id,
      name: `${product.name} for ${welcomeWiener.name}`,
      image: welcomeWiener.images[0] ?? null,
      price: product.price,
      quantity: 1,
      isPhysicalProduct: false,
      welcomeWienerId: welcomeWiener.id
    }
    dispatch(setOpenCartToast(cartItem))
    dispatch(addToCart(cartItem))

    setTimeout(() => setAdded((prev) => prev.filter((id) => id !== product.id)), 2000)
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback — do nothing
    }
  }

  const prevPhoto = () => setPhotoIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))
  const nextPhoto = () => setPhotoIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))

  const totalNeeded = products.reduce((sum, p) => sum + p.price, 0)

  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Back ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-8">
          <Link
            href="/welcomewieners"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <ChevronLeft className="w-3 h-3" aria-hidden="true" />
            All Dogs
          </Link>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
          {/* ── LEFT — Photo gallery ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="lg:sticky lg:top-8 space-y-3"
          >
            {/* Main photo */}
            <div
              className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
              aria-label="Dog photo gallery"
            >
              <AnimatePresence mode="wait">
                {allImages.length > 0 ? (
                  <motion.img
                    key={photoIndex}
                    src={allImages[photoIndex]}
                    alt={`${welcomeWiener.name ?? 'Dog'} photo ${photoIndex + 1} of ${allImages.length}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark tracking-widest uppercase">
                      No photo
                    </p>
                  </div>
                )}
              </AnimatePresence>

              {/* Prev / Next */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPhoto}
                    aria-label="Previous photo"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-bg-light/80 dark:bg-bg-dark/80 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={nextPhoto}
                    aria-label="Next photo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-bg-light/80 dark:bg-bg-dark/80 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>

                  {/* Counter */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-bg-light/80 dark:bg-bg-dark/80 border border-border-light dark:border-border-dark">
                    <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark tabular-nums">
                      {photoIndex + 1} / {allImages.length}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${Math.min(allImages.length, 5)}, 1fr)` }}
                role="list"
                aria-label="Photo thumbnails"
              >
                {allImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPhotoIndex(i)}
                    aria-label={`View photo ${i + 1}`}
                    aria-pressed={photoIndex === i}
                    className={`aspect-square overflow-hidden border-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                      ${
                        photoIndex === i
                          ? 'border-primary-light dark:border-primary-dark'
                          : 'border-border-light dark:border-border-dark hover:border-primary-light/50 dark:hover:border-primary-dark/50'
                      }`}
                  >
                    <Picture
                      priority={true}
                      src={url}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── RIGHT — Info + Products ── */}
          <div className="space-y-8">
            {/* ── Header ── */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="block w-5 h-px bg-primary-light dark:bg-primary-dark"
                  aria-hidden="true"
                />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  Welcome Wiener
                </p>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark leading-tight">
                    {welcomeWiener.name ?? 'Unknown'}
                  </h1>
                  {welcomeWiener.age && (
                    <p className="text-sm font-mono text-muted-light dark:text-muted-dark mt-1">
                      {welcomeWiener.age}
                    </p>
                  )}
                </div>

                {/* Share */}
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label={copied ? 'Link copied!' : 'Share this dog'}
                  className="shrink-0 flex items-center gap-2 px-3 py-2 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="text-[10px] font-mono tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark"
                      >
                        Copied!
                      </motion.span>
                    ) : (
                      <motion.span
                        key="share"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="text-[10px] font-mono tracking-[0.15em] uppercase">
                          Share
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>

            {/* ── Bio ── */}
            {welcomeWiener.bio && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={3}
                className="pt-6 border-t border-border-light dark:border-border-dark"
              >
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-3">
                  About
                </p>
                <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                  {welcomeWiener.bio}
                </p>
              </motion.div>
            )}

            {/* ── Products ── */}
            {products.length > 0 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={4}
                className="pt-6 border-t border-border-light dark:border-border-dark"
              >
                {/* Section header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1">
                      Items Needed
                    </p>
                    <p className="text-xs font-mono text-muted-light/60 dark:text-muted-dark/60">
                      {products.length} item{products.length !== 1 ? 's' : ''} · ${totalNeeded}{' '}
                      total
                    </p>
                  </div>
                </div>

                {/* Category filters */}
                {categories.length > 1 && (
                  <div
                    className="flex flex-wrap gap-1.5 mb-4"
                    role="group"
                    aria-label="Filter by category"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveCategory('all')}
                      aria-pressed={activeCategory === 'all'}
                      className={`px-3 py-1.5 text-[10px] font-mono tracking-[0.15em] uppercase border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                        ${
                          activeCategory === 'all'
                            ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                            : 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light/50 dark:hover:border-primary-dark/50'
                        }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        aria-pressed={activeCategory === cat}
                        className={`px-3 py-1.5 text-[10px] font-mono tracking-[0.15em] uppercase border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                          ${
                            activeCategory === cat
                              ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                              : 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light/50 dark:hover:border-primary-dark/50'
                          }`}
                      >
                        {WELCOME_WIENER_CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                )}

                {/* Product list */}
                <AnimatePresence mode="wait">
                  <motion.ul
                    key={activeCategory}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                    role="list"
                    aria-label={`Items needed for ${welcomeWiener.name}`}
                  >
                    {filteredProducts.map((product, i) => {
                      const isAdded = added.includes(product.id)
                      return (
                        <motion.li
                          key={product.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          role="listitem"
                        >
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            aria-label={`Add ${product.name} to cart — $${product.price}`}
                            className={`w-full flex items-center justify-between px-4 py-3.5 border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark text-left
                              ${
                                isAdded
                                  ? 'border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5'
                                  : 'border-border-light dark:border-border-dark hover:border-primary-light/50 dark:hover:border-primary-dark/50 bg-surface-light dark:bg-surface-dark'
                              }`}
                          >
                            <div className="min-w-0">
                              <p
                                className={`text-sm font-mono truncate ${isAdded ? 'text-primary-light dark:text-primary-dark' : 'text-text-light dark:text-text-dark'}`}
                              >
                                {product.name}
                              </p>
                              {product.description && (
                                <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark mt-0.5 truncate">
                                  {product.description}
                                </p>
                              )}
                              <span
                                className={`inline-block mt-1.5 text-[9px] font-mono tracking-[0.15em] uppercase px-1.5 py-0.5 border ${
                                  isAdded
                                    ? 'border-primary-light/30 dark:border-primary-dark/30 text-primary-light dark:text-primary-dark'
                                    : 'border-border-light dark:border-border-dark text-muted-light/60 dark:text-muted-dark/60'
                                }`}
                              >
                                {WELCOME_WIENER_CATEGORY_LABELS[product.category]}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 ml-4 shrink-0">
                              <span
                                className={`text-sm font-mono font-bold tabular-nums ${isAdded ? 'text-primary-light dark:text-primary-dark' : 'text-muted-light dark:text-muted-dark'}`}
                              >
                                ${product.price}
                              </span>
                              <motion.div
                                animate={isAdded ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`w-7 h-7 flex items-center justify-center border-2 transition-colors duration-200
                                  ${
                                    isAdded
                                      ? 'border-primary-light dark:border-primary-dark bg-primary-light dark:bg-primary-dark'
                                      : 'border-border-light dark:border-border-dark'
                                  }`}
                              >
                                {isAdded ? (
                                  <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                                ) : (
                                  <Plus
                                    className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark"
                                    aria-hidden="true"
                                  />
                                )}
                              </motion.div>
                            </div>
                          </button>
                        </motion.li>
                      )
                    })}
                  </motion.ul>
                </AnimatePresence>

                {/* Add all CTA */}
                {products.length > 1 && (
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={5}
                    className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between"
                  >
                    <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                      Donate everything {welcomeWiener.name} needs
                    </p>
                    <motion.button
                      type="button"
                      onClick={() => products.forEach((p) => handleAddToCart(p))}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      Add All · ${totalNeeded}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
