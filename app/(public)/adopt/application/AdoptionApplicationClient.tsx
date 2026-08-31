'use client'

import { ApplicationExpiryTimer } from 'app/components/features/adoption-application'
import { AdoptionFeeWelcomeModal } from 'app/components/features/adoption-application/AdoptionFeeModal'
import { fadeUp } from 'lib/constants/motion.constants'
import { useUiSelector } from 'lib/store/store'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function AdoptionApplicationClient({ expiresAt }: { expiresAt: Date | null }) {
  const { isDark } = useUiSelector()
  const [modalOpen, setModalOpen] = useState(true)
  const params = useSearchParams()
  const myPackTab = params.get('ref')

  return (
    <>
      <AdoptionFeeWelcomeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <main
        id="main-content"
        className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          {/* ── Header ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-12 sm:mb-16"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span
                  className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
                  aria-hidden="true"
                />
                <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  Adoption
                </p>
              </div>
              <Link
                href={`/my-pack${myPackTab}`}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <ChevronLeft className="w-3 h-3" aria-hidden="true" />
                My Pack
              </Link>
            </div>
            <h1 className="  text-4xl sm:text-5xl uppercase leading-none text-text-light dark:text-text-dark mb-5">
              Adoption Application
            </h1>
            <div className="flex items-center gap-2 mb-5">
              <span className="block w-3 h-px bg-amber-500 shrink-0" aria-hidden="true" />
              <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-amber-500">
                Progress is not saved — leaving or refreshing will reset the form
              </p>
            </div>
            <p className="text-base text-muted-light dark:text-muted-dark leading-relaxed">
              Thank you for taking the next step toward adopting a Little Paws dachshund. Please
              complete the application below. Our team will review your submission and be in touch
              within 3–5 business days.
            </p>
          </motion.div>

          {/* ── Timer ── */}
          {expiresAt && <ApplicationExpiryTimer expiresAt={expiresAt} />}

          {/* ── Application iframe ── */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            custom={2}
            aria-labelledby="application-heading"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                aria-hidden="true"
              />
              <h2
                id="application-heading"
                className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
              >
                Application Form
              </h2>
            </div>
            <div className="border border-border-light dark:border-border-dark overflow-hidden">
              {isDark ? (
                <iframe
                  title="Adoption Application"
                  width="100%"
                  className="h-[calc(100svh-475px)] block"
                  src="https://toolkit.rescuegroups.org/of/f?c=ZKCVRYSQ"
                ></iframe>
              ) : (
                <iframe
                  title="Adoption Application"
                  width="100%"
                  className="h-[calc(100svh-475px)] block"
                  src="https://toolkit.rescuegroups.org/of/f?c=WHMQCBRV"
                />
              )}
            </div>
          </motion.section>
        </div>
      </main>
    </>
  )
}
