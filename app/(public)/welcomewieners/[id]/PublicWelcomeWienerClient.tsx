'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Check, Share2 } from 'lucide-react'
import Link from 'next/link'
import { IWelcomeWiener, WelcomeWienerProduct } from 'types/welcome-wiener'
import { fadeUp } from 'lib/constants/motion.constants'
import Picture from 'components/_common/Picture'
import { LinkBody } from 'components/_common/LinkBody'
import { WELCOME_WIENER_CATEGORY_LABELS } from 'lib/constants/welcome-wiener.constants'
import { useCartStore } from 'stores/cart.store'
import { useModalsStore } from 'stores/modals.store'

const PHOTO_ARROW =
  'absolute top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

export default function PublicWelcomeWienerClient({ welcomeWiener }: { welcomeWiener: IWelcomeWiener }) {
  const addToCart = useCartStore((s) => s.addToCart)
  const showCartToast = useModalsStore((s) => s.showCartToast)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [added, setAdded] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const name = welcomeWiener.name ?? 'this dog'
  const images = welcomeWiener.images ?? []
  const current = images[photoIndex]

  // Cheapest first within each category, so the easiest yes is always at the top
  const products = [...((welcomeWiener.associatedProducts ?? []) as WelcomeWienerProduct[])].sort(
    (a, b) => Number(a.price) - Number(b.price)
  )
  const groups = [...new Set(products.map((p) => p.category))].map((category) => ({
    category,
    items: products.filter((p) => p.category === category)
  }))
  const totalNeeded = products.reduce((sum, p) => sum + Number(p.price ?? 0), 0)
  const allAdded = products.length > 0 && products.every((p) => added.includes(p.id))

  const handleAddToCart = (product: WelcomeWienerProduct) => {
    if (added.includes(product.id)) return
    setAdded((prev) => [...prev, product.id])

    // The cart id includes the dog so two dogs' matching items (both have ww-bed) stay separate lines;
    // checkout sends only welcomeWienerProductId and the dog's id to Stripe
    const cartItem = {
      id: `${welcomeWiener.id}-${product.id}`,
      welcomeWienerId: welcomeWiener.id,
      welcomeWienerProductId: product.id,
      name: `${product.name} for ${name}`,
      image: images[0] ?? null,
      price: Number(product.price),
      quantity: 1,
      isPhysicalProduct: false,
      type: 'WELCOME_WIENER'
    }
    addToCart(cartItem)
    showCartToast(cartItem)

    setTimeout(() => setAdded((prev) => prev.filter((id) => id !== product.id)), 2000)
  }

  // Phones get the native share sheet, since most people will text the link; elsewhere it's copied
  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Help ${name}`,
          text: `${name} is in the care of Little Paws Dachshund Rescue and could use a hand.`,
          url
        })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Closing the share sheet throws too, and there's nothing to tell the person either way
    }
  }

  const prevPhoto = () => setPhotoIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const nextPhoto = () => setPhotoIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-24 sm:pb-32">
        {/* ── Back ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-8">
          <Link
            href="/welcomewieners"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <LinkBody icon={<ChevronLeft className="w-3 h-3" aria-hidden="true" />} label="All dogs" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16 items-start">
          {/* ── Photos ── */}
          {/* Pinned just under the header, and moves with it as it hides and shows */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="lg:sticky lg:top-[calc(var(--header-offset,0px)+2rem)] transition-[top] duration-300 ease-out space-y-3"
          >
            <div
              className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
              aria-label={`Photos of ${name}`}
            >
              {current ? (
                <>
                  {/* A blurred copy fills the space around photos that aren't square, so the whole dog shows uncropped */}
                  <div aria-hidden="true" className="absolute inset-0">
                    <Picture src={current} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-70" />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={photoIndex}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Picture
                        src={current}
                        alt={`${name}, photo ${photoIndex + 1} of ${images.length}`}
                        priority={photoIndex === 0}
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  </AnimatePresence>
                </>
              ) : (
                <p className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-muted-light dark:text-muted-dark tracking-widest uppercase">
                  Photo coming soon
                </p>
              )}

              {images.length > 1 && (
                <>
                  <button type="button" onClick={prevPhoto} aria-label="Previous photo" className={`${PHOTO_ARROW} left-3`}>
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={nextPhoto} aria-label="Next photo" className={`${PHOTO_ARROW} right-3`}>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <p
                    className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-[10px] font-mono tabular-nums"
                    aria-hidden="true"
                  >
                    {photoIndex + 1} / {images.length}
                  </p>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 5)}, 1fr)` }}
                role="list"
                aria-label="Photo thumbnails"
              >
                {images.map((url, i) => (
                  <li key={url}>
                    <button
                      type="button"
                      onClick={() => setPhotoIndex(i)}
                      aria-label={`View photo ${i + 1}`}
                      aria-pressed={photoIndex === i}
                      className={`block w-full aspect-square overflow-hidden border-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                        photoIndex === i
                          ? 'border-primary-light dark:border-primary-dark'
                          : 'border-border-light dark:border-border-dark opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Picture src={url} alt="" priority={i === 0} className="w-full h-full object-cover" />
                    </button>
                  </li>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Info + wish list ── */}
          <div className="space-y-8">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
              <div className="flex items-center gap-3 mb-3">
                <span className="block w-5 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
                <p className="text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">Welcome Wiener</p>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark leading-tight">
                    {welcomeWiener.name ?? 'Unknown'}
                  </h1>
                  {welcomeWiener.age && <p className="text-sm font-mono text-muted-light dark:text-muted-dark mt-1">{welcomeWiener.age}</p>}
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label={copied ? 'Link copied' : `Share ${name}'s page`}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark text-[10px] font-mono tracking-eyebrow uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  {copied ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Share2 className="w-3.5 h-3.5" aria-hidden="true" />}
                  {copied ? 'Copied' : 'Share'}
                </button>
              </div>
            </motion.div>

            {welcomeWiener.bio && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={3}
                className="pt-6 border-t border-border-light dark:border-border-dark"
              >
                <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-3">
                  {name}&apos;s story
                </p>
                <p className="text-base text-text-light dark:text-text-dark leading-relaxed">{welcomeWiener.bio}</p>
              </motion.div>
            )}

            {products.length > 0 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={4}
                className="pt-6 border-t border-border-light dark:border-border-dark"
              >
                <div className="flex items-baseline justify-between gap-4 mb-5">
                  <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">Wish list</p>
                  <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                    {products.length} item{products.length !== 1 ? 's' : ''} · ${totalNeeded.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-6">
                  {groups.map(({ category, items }) => (
                    <section key={category} aria-label={WELCOME_WIENER_CATEGORY_LABELS[category]}>
                      {groups.length > 1 && (
                        <p className="mb-2 text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
                          {WELCOME_WIENER_CATEGORY_LABELS[category]}
                        </p>
                      )}
                      <ul className="space-y-2" role="list">
                        {items.map((product) => {
                          const isAdded = added.includes(product.id)
                          return (
                            <li key={product.id}>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(product)}
                                aria-label={`Add ${product.name}, $${product.price}, for ${name}`}
                                className={`w-full flex items-center justify-between gap-4 px-4 py-3.5 border text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                                  isAdded
                                    ? 'border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5'
                                    : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary-light/60 dark:hover:border-primary-dark/60'
                                }`}
                              >
                                <div className="min-w-0">
                                  <p
                                    className={`text-sm truncate ${isAdded ? 'text-primary-light dark:text-primary-dark' : 'text-text-light dark:text-text-dark'}`}
                                  >
                                    {product.name}
                                  </p>
                                  {product.description && (
                                    <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5 truncate">{product.description}</p>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-sm font-mono font-bold tabular-nums text-primary-light dark:text-primary-dark">
                                    ${product.price}
                                  </span>
                                  <motion.span
                                    animate={isAdded ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={`w-7 h-7 flex items-center justify-center border-2 transition-colors duration-200 ${
                                      isAdded
                                        ? 'border-primary-light dark:border-primary-dark bg-primary-light dark:bg-primary-dark'
                                        : 'border-border-light dark:border-border-dark'
                                    }`}
                                    aria-hidden="true"
                                  >
                                    {isAdded ? (
                                      <Check className="w-3.5 h-3.5 text-white" />
                                    ) : (
                                      <Plus className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
                                    )}
                                  </motion.span>
                                </div>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </section>
                  ))}
                </div>

                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => products.forEach(handleAddToCart)}
                    disabled={allAdded}
                    className="mt-6 w-full flex items-center justify-between px-5 py-4 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-70 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    <span className="text-[11px] font-mono tracking-eyebrow uppercase">
                      {allAdded ? 'All added' : `Donate everything ${name} needs`}
                    </span>
                    <span className="text-base font-mono font-bold tabular-nums">${totalNeeded.toLocaleString()}</span>
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
