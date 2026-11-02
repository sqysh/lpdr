import { Plus, Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { IWelcomeWiener, WelcomeWienerProduct } from 'types/welcome-wiener'
import { motion } from 'framer-motion'
import Picture from 'components/_common/Picture'
import { LinkBody } from 'components/_common/LinkBody'
import { fadeUp } from 'lib/constants/motion.constants'

export function WelcomeWienerCard({
  dog,
  index,
  onAddProduct
}: {
  dog: IWelcomeWiener
  index: number
  onAddProduct: (dog: IWelcomeWiener, product: WelcomeWienerProduct) => void
}) {
  const [added, setAdded] = useState<string[]>([])

  // Cheapest first, so the first thing a visitor sees is something easy to say yes to
  const products = [...((dog.associatedProducts ?? []) as WelcomeWienerProduct[])].sort((a, b) => Number(a.price) - Number(b.price))
  const total = products.reduce((sum, p) => sum + Number(p.price ?? 0), 0)
  // First sentence of the bio, which is usually how the dog came to the rescue
  const story = dog.bio?.match(/^[^.!?]+[.!?]/)?.[0] ?? dog.bio

  const handleAdd = (product: WelcomeWienerProduct) => {
    if (added.includes(product.id)) return
    setAdded((prev) => [...prev, product.id])
    onAddProduct(dog, product)
    setTimeout(() => setAdded((prev) => prev.filter((id) => id !== product.id)), 2000)
  }

  const allAdded = products.length > 0 && products.every((p) => added.includes(p.id))

  return (
    <motion.article
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={index}
      className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden"
      aria-label={`${dog.name ?? 'Dog'}, Welcome Wiener`}
    >
      {/* ── Photo ── */}
      <div className="relative aspect-16/10 overflow-hidden bg-bg-light dark:bg-bg-dark">
        {dog.images[0] ? (
          <>
            {/* A blurred copy fills the space around photos that don't match the card's shape, like a tall phone photo */}
            <div aria-hidden="true" className="absolute inset-0">
              <Picture src={dog.images[0]} alt="" className="w-full h-full object-cover scale-110 blur-2xl opacity-70" />
            </div>
            <Picture
              src={dog.images[0]}
              alt={dog.name ?? 'Dog photo'}
              priority={index === 0}
              className="absolute inset-0 w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-muted-light dark:text-muted-dark tracking-widest uppercase">
            Photo coming soon
          </span>
        )}

        {dog.age && (
          <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/55 text-white text-[10px] font-mono tracking-eyebrow uppercase">
            {dog.age}
          </span>
        )}
      </div>

      {/* ── Info ── */}
      <div className="px-5 pt-5">
        <h2 className="font-quicksand font-black text-xl text-text-light dark:text-text-dark leading-tight">{dog.name ?? 'Unknown'}</h2>
        {story && <p className="mt-2 text-sm text-muted-light dark:text-muted-dark leading-relaxed line-clamp-2">{story}</p>}
      </div>

      {/* ── Wish list ── */}
      {products.length > 0 ? (
        <div className="px-5 pt-5 pb-5 flex-1 flex flex-col">
          <p className="mb-3 text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
            Wish list · {products.length} item{products.length !== 1 ? 's' : ''}
          </p>

          <ul className="space-y-1.5" role="list" aria-label={`${dog.name}'s wish list`}>
            {products.map((product) => {
              const isAdded = added.includes(product.id)
              return (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleAdd(product)}
                    aria-label={`Add ${product.name}, $${product.price}, for ${dog.name}`}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 border text-left bg-bg-light dark:bg-bg-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                      isAdded
                        ? 'border-primary-light dark:border-primary-dark'
                        : 'border-border-light dark:border-border-dark hover:border-primary-light/60 dark:hover:border-primary-dark/60'
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`text-sm truncate ${isAdded ? 'text-primary-light dark:text-primary-dark' : 'text-text-light dark:text-text-dark'}`}
                      >
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-[11px] text-muted-light dark:text-muted-dark truncate mt-0.5">{product.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-mono font-bold tabular-nums text-primary-light dark:text-primary-dark">
                        ${product.price}
                      </span>
                      <span
                        className={`w-6 h-6 flex items-center justify-center border transition-colors duration-150 ${
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
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          {products.length > 1 && (
            <button
              type="button"
              onClick={() => products.forEach(handleAdd)}
              disabled={allAdded}
              className="mt-4 w-full flex items-center justify-between px-4 py-3 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <span className="text-[11px] font-mono tracking-eyebrow uppercase">{allAdded ? 'All added' : 'Add the whole list'}</span>
              <span className="text-sm font-mono font-bold tabular-nums">${total.toLocaleString()}</span>
            </button>
          )}
        </div>
      ) : (
        <p className="px-5 pt-4 pb-5 text-xs text-muted-light dark:text-muted-dark flex-1">No items listed yet.</p>
      )}

      {/* ── Profile ── */}
      <div className="px-5 pb-5">
        <Link
          href={`/welcomewieners/${dog.id}`}
          aria-label={`View full profile for ${dog.name ?? 'this dog'}`}
          className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark text-[10px] font-mono tracking-eyebrow uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <LinkBody icon={<ChevronRight className="w-3 h-3" aria-hidden="true" />} label={`Read ${dog.name ?? 'their'}'s story`} />
        </Link>
      </div>
    </motion.article>
  )
}
