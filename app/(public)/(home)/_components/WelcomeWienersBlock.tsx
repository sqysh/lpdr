'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import Link, { useLinkStatus } from 'next/link'
import { IWelcomeWiener, WelcomeWienerProduct } from 'types/welcome-wiener'
import Picture from 'components/_common/Picture'
import { LinkBody } from 'components/_common/LinkBody'

const SHOWN = 3

// Columns match the number of dogs, so two dogs fill the row instead of leaving a third of it empty
const GRID_COLS: Record<number, string> = {
  1: 'sm:grid-cols-1 max-w-xl',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3'
}

function needs(dog: IWelcomeWiener) {
  const items = (dog.associatedProducts ?? []) as unknown as WelcomeWienerProduct[]
  const total = items.reduce((sum, item) => sum + Number(item.price ?? 0), 0)
  // Cheapest first, so the first thing a visitor sees is something easy to say yes to
  const preview = [...items].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 3)
  // First sentence of the bio, which is usually how the dog came to the rescue
  const story = dog.bio?.match(/^[^.!?]+[.!?]/)?.[0] ?? null
  return { count: items.length, total, preview, story }
}

/** useLinkStatus only reports on a navigation, so it has to live inside the card's Link */
function CardPending() {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return (
    <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/40" aria-hidden="true">
      <Loader2 className="w-6 h-6 text-white animate-spin" />
    </span>
  )
}

export const WelcomeWienersBlock = ({ data }: { data: IWelcomeWiener[] }) => {
  const dogs = data ?? []
  const shown = dogs.slice(0, SHOWN)

  return (
    <section
      aria-labelledby="welcome-wieners-heading"
      className="w-full bg-bg-light dark:bg-bg-dark px-4 xs:px-5 sm:px-6 lg:px-8 py-16 sm:py-20"
    >
      <div className="max-w-300 mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3" aria-hidden="true">
              <div className="w-6 sm:w-8 h-px bg-primary-light dark:bg-primary-dark" />
              <p className="text-[10px] sm:text-xs font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                Welcome Wieners
              </p>
            </div>
            <h2
              id="welcome-wieners-heading"
              className="font-quicksand leading-tight text-text-light dark:text-text-dark text-3xl sm:text-4xl"
            >
              <span className="font-black">Help a dog </span>
              <span className="font-light">in our care</span>
            </h2>
            <p className="mt-2 text-sm text-muted-light dark:text-muted-dark max-w-md leading-relaxed">
              {dogs.length
                ? 'Each dog has a wish list. Pick an item and it goes straight to them.'
                : 'All of our Welcome Wieners have found homes. Check back soon, or make a general donation to support our next rescue.'}
            </p>
          </div>

          {dogs.length > 0 ? (
            <Link
              href="/welcomewieners"
              className="inline-flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] tracking-eyebrow uppercase text-primary-light dark:text-primary-dark hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <LinkBody
                icon={<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
                label={dogs.length > SHOWN ? `See all ${dogs.length} dogs` : 'See all'}
              />
            </Link>
          ) : (
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 self-start px-6 py-3 border-2 border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark text-xs font-mono tracking-eyebrow uppercase hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <LinkBody icon={<ArrowRight className="w-4 h-4" aria-hidden="true" />} label="Make a donation" />
            </Link>
          )}
        </div>

        {shown.length > 0 && (
          <ul role="list" className={`grid grid-cols-1 gap-4 sm:gap-6 ${GRID_COLS[shown.length]}`}>
            {shown.map((dog, i) => {
              const { count, total, preview, story } = needs(dog)
              return (
                <li key={dog.id}>
                  <Link
                    href={`/welcomewieners/${dog.id}`}
                    className="group flex flex-col h-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-bg-light dark:bg-bg-dark">
                      {dog.images?.[0] ? (
                        <>
                          {/* A blurred copy fills the space around photos that don't match the card's shape, like a tall phone photo */}
                          <Picture
                            src={dog.images[0]}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70"
                          />
                          <Picture
                            src={dog.images[0]}
                            alt=""
                            priority={i === 0}
                            className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <div
                            className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"
                            aria-hidden="true"
                          />
                        </>
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-widest uppercase text-muted-light dark:text-muted-dark">
                          Photo coming soon
                        </span>
                      )}

                      {dog.age && (
                        <span className="absolute bottom-3 left-3 z-10 px-2 py-1 bg-black/55 text-white text-[10px] font-mono tracking-eyebrow uppercase">
                          {dog.age}
                        </span>
                      )}

                      <CardPending />
                    </div>

                    <div className="flex flex-col flex-1 p-5">
                      <p className="font-quicksand font-black text-xl text-text-light dark:text-text-dark leading-tight">{dog.name}</p>
                      {dog.age && <p className="mt-0.5 text-xs font-mono text-muted-light dark:text-muted-dark">{dog.age}</p>}

                      {story && <p className="mt-3 text-sm text-muted-light dark:text-muted-dark leading-relaxed line-clamp-2">{story}</p>}

                      {preview.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Some of what ${dog.name} needs`}>
                          {preview.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center gap-2 px-2.5 py-1 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-xs text-text-light dark:text-text-dark"
                            >
                              {item.name}
                              <span className="font-mono text-primary-light dark:text-primary-dark">${Number(item.price)}</span>
                            </li>
                          ))}
                          {count > preview.length && (
                            <li className="px-2.5 py-1 text-xs text-muted-light dark:text-muted-dark">+{count - preview.length} more</li>
                          )}
                        </ul>
                      )}

                      <span className="mt-auto pt-5 flex items-center justify-between font-mono text-[11px] tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
                        See all {count} items · ${total.toLocaleString()}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
