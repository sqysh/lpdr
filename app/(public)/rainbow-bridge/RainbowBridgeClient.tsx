'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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

const formatMonthYear = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

const ctaClass =
  'inline-flex items-center gap-3 px-6 py-3.5 text-sm uppercase tracking-widest text-white bg-primary-light dark:bg-primary-dark hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 focus-visible:ring-offset-bg-light dark:focus-visible:ring-offset-bg-dark'

export default function RainbowBridgeClient({ memorials, canRemember }: { memorials: WallMemorial[]; canRemember: boolean }) {
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {memorials.map((m, i) => (
              <motion.li
                key={m.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                custom={(i % 3) * 0.25}
                className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
              >
                <article aria-labelledby={`memorial-${m.id}`}>
                  <Image
                    src={`/api/memorial-art/${m.id}?v=${m.version}`}
                    alt={`A butterfly over the Rainbow Bridge carrying the name ${m.dogName}`}
                    width={960}
                    height={640}
                    unoptimized
                    loading={i < 3 ? 'eager' : 'lazy'}
                    className="w-full h-auto"
                  />
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      {m.photoUrl && (
                        <Image
                          src={m.photoUrl}
                          alt={m.dogName}
                          width={112}
                          height={112}
                          sizes="56px"
                          className="w-14 h-14 shrink-0 object-cover border border-border-light dark:border-border-dark"
                        />
                      )}
                      <div className="min-w-0">
                        <h2
                          id={`memorial-${m.id}`}
                          className="font-quicksand text-lg font-bold text-text-light dark:text-text-dark leading-snug wrap-break-word"
                        >
                          {m.dogName}
                        </h2>
                        {m.donorName && (
                          <p className="text-sm text-muted-light dark:text-muted-dark wrap-break-word">Loved by {m.donorName}</p>
                        )}
                      </div>
                    </div>
                    {m.message && (
                      <p className="mt-3 text-sm text-muted-light dark:text-muted-dark leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {m.message}
                      </p>
                    )}
                    <p className="mt-3 text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark">
                      {formatMonthYear(m.date)}
                    </p>
                  </div>
                </article>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
