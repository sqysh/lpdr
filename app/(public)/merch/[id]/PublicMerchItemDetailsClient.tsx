'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Minus, Plus } from 'lucide-react'
import Picture from 'components/_common/Picture'
import { store, useCartSelector } from 'lib/store/store'
import { addToCart } from 'lib/store/slices/cartSlice'
import { setOpenCartToast } from 'lib/store/slices/uiSlice'

export interface ISize {
  size: string
  quantity: number
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, easing: [0.22, 1, 0.36, 1] }
  })
}

export default function PublicMerchItemDetailsClient({ product }: { product: any }) {
  const { items: cartItems } = useCartSelector()

  const images: string[] = product?.images ?? []
  const sizes: ISize[] = product?.sizes ?? []
  const hasSizes = sizes.length > 0

  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [rawQuantity, setRawQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const selectedSizeObj = sizes.find((s) => s.size === selectedSize)

  // normalize both sides — a cart line saved without a size field has size === undefined,
  // and undefined === null is false, which makes inCart read 0 forever
  const inCart =
    cartItems.find((i) => i.id === product.id && (i.size ?? null) === (selectedSize ?? null))
      ?.quantity ?? 0

  const stockForSelection = hasSizes
    ? (selectedSizeObj?.quantity ?? 0)
    : (product?.countInStock ?? 99)
  const remaining = Math.max(0, stockForSelection - inCart)
  const quantity = Math.max(1, Math.min(rawQuantity, remaining || 1))

  const outOfStock = hasSizes ? sizes.every((s) => s.quantity <= 0) : product?.countInStock === 0
  const atCartLimit = !outOfStock && remaining === 0
  const canAdd = !outOfStock && !atCartLimit && (!hasSizes || !!selectedSize)

  const handleAddToCart = () => {
    if (!canAdd || added) return

    const cartItem = {
      id: product.id,
      name: product.name,
      image: images[0] ?? null,
      price: product.price,
      quantity,
      size: selectedSize ?? null,
      isPhysicalProduct: product.isPhysicalProduct,
      shippingPrice: product.shippingPrice ?? 0,
      maxQuantity: stockForSelection
    }

    store.dispatch(addToCart(cartItem))
    store.dispatch(setOpenCartToast(cartItem))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <main
      id="main-content"
      className="min-h-dvh bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* ── Back ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
          <Link
            href="/merch"
            className="inline-flex items-center gap-1.5   text-[10px] uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark mb-8"
          >
            <ChevronLeft className="w-3 h-3" aria-hidden="true" />
            All Merch
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Gallery ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark aspect-square overflow-hidden">
              {images[activeImage] ? (
                <Picture
                  priority={true}
                  src={images[activeImage]}
                  alt={`${product.name}${images.length > 1 ? ` — photo ${activeImage + 1} of ${images.length}` : ''}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="  text-[10px] uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">
                    No photo
                  </span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Product photos">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-pressed={activeImage === i}
                    aria-label={`Photo ${i + 1}`}
                    className={`w-14 h-14 shrink-0 border-2 overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                      ${activeImage === i ? 'border-primary-light dark:border-primary-dark' : 'border-border-light dark:border-border-dark hover:border-muted-light dark:hover:border-muted-dark'}`}
                  >
                    <Picture
                      priority={true}
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Details ── */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
                aria-hidden="true"
              />
              <p className="  text-[10px] uppercase tracking-[0.25em] text-primary-light dark:text-primary-dark">
                Merch
              </p>
            </div>

            <h1 className="font-quicksand text-3xl sm:text-4xl font-black leading-tight mb-2">
              {product.name}
            </h1>

            <p className="font-quicksand font-black text-2xl text-primary-light dark:text-primary-dark tabular-nums mb-6">
              ${product.price.toFixed(2)}
            </p>

            {product.description && (
              <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* ── Sizes ── */}
            {hasSizes && (
              <fieldset className="mb-6">
                <legend className="  text-[10px] uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark mb-2">
                  Size
                </legend>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
                  {sizes.map((s) => {
                    const soldOut = s.quantity <= 0
                    const active = selectedSize === s.size
                    return (
                      <button
                        key={s.size}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={soldOut}
                        onClick={() => {
                          setSelectedSize(s.size)
                          setRawQuantity(Math.min(remaining, quantity + 1))
                        }}
                        className={`min-w-12 px-3 py-2.5 border-2 font-mono text-xs uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                          ${
                            active
                              ? 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark'
                              : soldOut
                                ? 'border-border-light dark:border-border-dark text-muted-light/50 dark:text-muted-dark/40 line-through cursor-not-allowed'
                                : 'border-border-light dark:border-border-dark hover:border-muted-light dark:hover:border-muted-dark'
                          }`}
                      >
                        {s.size}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )}

            {/* ── Quantity ── */}
            {!outOfStock && (
              <div className="mb-8">
                <p
                  className="  text-[10px] uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark mb-2"
                  id="qty-label"
                >
                  Quantity
                </p>
                <div
                  className="inline-flex items-center border border-border-light dark:border-border-dark"
                  role="group"
                  aria-labelledby="qty-label"
                >
                  <button
                    type="button"
                    onClick={() => setRawQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 flex items-center justify-center disabled:opacity-30 hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <span
                    className="w-10 text-center font-mono text-sm tabular-nums"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setRawQuantity(Math.min(remaining, quantity + 1))}
                    disabled={quantity >= remaining}
                    aria-label="Increase quantity"
                    className="w-10 h-10 flex items-center justify-center disabled:opacity-30 hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
                {hasSizes && selectedSizeObj && selectedSizeObj.quantity <= 5 && (
                  <p className="mt-2 font-mono text-[10px] text-muted-light dark:text-muted-dark">
                    Only {selectedSizeObj.quantity} left
                  </p>
                )}
              </div>
            )}

            {/* ── CTA ── */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canAdd}
              className="w-full sm:w-auto bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-[10px] tracking-[0.2em] uppercase py-4 px-10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              {outOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
