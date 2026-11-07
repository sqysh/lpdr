'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { fadeUp } from 'lib/constants/motion.constants'
import { LinkBody } from 'components/_common/LinkBody'

export type WallMemorial = {
  id: string
  dogName: string
  message: string | null
  photoUrl: string | null
  donorName: string | null
  date: string
  version: number
}

type Viewing = { src: string; dogName: string }

const formatMonthYear = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const ctaClass =
  'inline-flex items-center gap-3 px-6 py-3.5 text-sm uppercase tracking-widest text-white bg-primary-light dark:bg-primary-dark hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bg-light dark:focus-visible:ring-offset-bg-dark'

function PhotoViewer({ viewing, onClose }: { viewing: Viewing | null; onClose: () => void }) {
  useEffect(() => {
    if (!viewing) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewing, onClose])

  return (
    <AnimatePresence>
      {viewing && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo of ${viewing.dogName}`}
          className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close photo"
            className="absolute top-[calc(var(--staging-bar-height,0px)+1rem)] right-4 p-2 text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
          <motion.figure
            initial={{ scale: 0.96, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.96 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="bg-white p-3 pb-10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Plain img so an animated GIF plays at full size */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={viewing.src} alt={viewing.dogName} className="block max-w-[85vw] max-h-[75vh] w-auto h-auto" />
            <figcaption className="mt-3 text-center font-signature text-3xl text-neutral-800">{viewing.dogName}</figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function RainbowBridgeClient({ memorials, canRemember }: { memorials: WallMemorial[]; canRemember: boolean }) {
  const [viewing, setViewing] = useState<Viewing | null>(null)

  return (
    <main className="min-h-dvh px-4 1150:px-0 pt-12 sm:pt-16 pb-24 sm:pb-32 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-5xl mx-auto w-full">
        <motion.header variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
            <p className="text-xs font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">Rainbow Bridge</p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-5">
            Forever <span className="font-light text-muted-light dark:text-muted-dark">Loved</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-light dark:text-on-dark leading-relaxed max-w-2xl mb-8">
            Every butterfly here carries the name of a dog who was deeply loved. Each one was placed by their family with a gift that helps
            a dachshund in our care today.
          </p>

          {canRemember && (
            <Link href="/rainbow-bridge/remember" className={ctaClass}>
              <LinkBody
                icon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
                label="Remember your dog"
                spinnerClass="w-4 h-4"
                iconAfter
              />
            </Link>
          )}
        </motion.header>

        {memorials.length === 0 ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.5}
            className="py-16 px-6 text-center border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
          >
            <p className="font-quicksand text-xl font-bold text-text-light dark:text-text-dark mb-2">
              The first butterflies are on their way
            </p>
            <p className="text-sm text-muted-light dark:text-muted-dark">
              {canRemember ? 'Be the first to place one for a dog you loved.' : 'Check back soon.'}
            </p>
          </motion.div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {memorials.map((m, i) => (
              <motion.li
                key={m.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                custom={(i % 2) * 0.2}
                className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
              >
                <article aria-labelledby={`memorial-${m.id}`}>
                  <div className="relative">
                    <Image
                      src={`/api/memorial-art/${m.id}?v=${m.version}`}
                      alt={`A butterfly over the Rainbow Bridge carrying the name ${m.dogName}`}
                      width={960}
                      height={640}
                      unoptimized
                      loading={i < 2 ? 'eager' : 'lazy'}
                      className="w-full h-auto"
                    />

                    {m.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setViewing({ src: m.photoUrl!, dogName: m.dogName })}
                        aria-label={`View photo of ${m.dogName}`}
                        className="absolute left-5 sm:left-6 -bottom-14 sm:-bottom-16 w-28 sm:w-36 p-1.5 sm:p-2 pb-5 sm:pb-6 bg-white -rotate-3 shadow-[0_10px_24px_rgba(0,0,0,0.45)] hover:rotate-0 hover:scale-105 transition-transform duration-300 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                      >
                        <Image
                          src={m.photoUrl}
                          alt=""
                          width={288}
                          height={288}
                          unoptimized
                          className="block w-full aspect-square object-cover"
                        />
                      </button>
                    )}
                  </div>

                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <div className={m.photoUrl ? 'pl-32 sm:pl-42 pt-4 min-h-14 sm:min-h-16' : 'pt-4'}>
                      <h2
                        id={`memorial-${m.id}`}
                        className="font-quicksand text-xl font-bold text-text-light dark:text-text-dark leading-snug wrap-break-word"
                      >
                        {m.dogName}
                      </h2>
                      {m.donorName && (
                        <p className="mt-0.5 text-sm text-muted-light dark:text-muted-dark wrap-break-word">Loved by {m.donorName}</p>
                      )}
                    </div>

                    {m.message && (
                      <p className="mt-6 text-sm text-muted-light dark:text-muted-dark leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {m.message}
                      </p>
                    )}
                    <p className="mt-4 text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark">
                      {formatMonthYear(m.date)}
                    </p>
                  </div>
                </article>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <PhotoViewer viewing={viewing} onClose={() => setViewing(null)} />
    </main>
  )
}
