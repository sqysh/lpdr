'use client'

import { AdoptionFeeWelcomeModal } from 'app/(public)/adopt/application/_components/AdoptionFeeModal'
import { ChevronDown, ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ApplicationExpiryTimer } from './_components/ApplicationExpiryTimer'
import { useThemeStore } from 'stores/theme.store'
import { LinkBody } from 'components/_common/LinkBody'

const subtleLink =
  'shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

// amber-600 rather than 500 so the warning clears 4.5:1 on the light background
const warningText = 'text-[10px] font-mono tracking-[0.15em] uppercase text-amber-600 dark:text-amber-400'

// RescueGroups hosts a light and a dark version of the same form
const FORM_CODE_DARK = 'ZKCVRYSQ'
const FORM_CODE_LIGHT = 'WHMQCBRV'

export default function AdoptionApplicationClient({ expiresAt }: { expiresAt: Date | null }) {
  const isDark = useThemeStore((s) => s.isDark)
  const isResolved = useThemeStore((s) => s.isResolved)
  const [modalOpen, setModalOpen] = useState(true)
  const [introOpen, setIntroOpen] = useState(true)

  const params = useSearchParams()
  const myPackTab = params.get('ref')
  const myPackHref = myPackTab ? `/my-pack?tab=${myPackTab}` : '/my-pack'

  // min-h keeps the form usable on short screens, where the calc leaves almost
  // nothing once the intro is expanded
  const frameHeight = `${introOpen ? 'h-[calc(100svh-490px)]' : 'h-[calc(100svh-120px)]'} min-h-125`

  return (
    <>
      <AdoptionFeeWelcomeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
        <div className={`max-w-3xl mx-auto px-4 sm:px-6 ${introOpen ? 'pt-8 sm:pt-16' : 'pt-4'}`}>
          {/* ── Header ── */}
          <div className="mb-4">
            {introOpen ? (
              <div id="application-intro">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
                    <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                      Adoption
                    </p>
                  </div>
                  <Link href={myPackHref} className={subtleLink}>
                    <LinkBody icon={<ChevronLeft className="w-3 h-3" aria-hidden="true" />} label="My Pack" />
                  </Link>
                </div>

                <h1 className="text-2xl xs:text-3xl sm:text-5xl uppercase leading-none text-text-light dark:text-text-dark mb-4 sm:mb-5">
                  Adoption Application
                </h1>

                <div className="flex items-start gap-2 mb-4 sm:mb-5">
                  <span className="block w-3 h-px bg-amber-600 dark:bg-amber-400 shrink-0 mt-1.5" aria-hidden="true" />
                  <p className={warningText}>Progress is not saved — leaving or refreshing will reset the form</p>
                </div>

                <p className="text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed mb-4 sm:mb-5">
                  Thank you for taking the next step toward adopting a Little Paws dachshund. Please complete the application
                  below in one sitting, then our team will review your submission and be in touch within 3–5 business days. Your
                  access stays open for the full week, so you can return and start a fresh application from{' '}
                  <Link
                    href="/my-pack"
                    className="text-primary-light dark:text-primary-dark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    My Pack
                  </Link>{' '}
                  if you need to.
                </p>

                {expiresAt && (
                  <div className="mb-4 sm:mb-5">
                    <ApplicationExpiryTimer expiresAt={expiresAt} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIntroOpen(false)}
                  aria-expanded={true}
                  aria-controls="application-intro"
                  className={subtleLink}
                >
                  Hide details
                  <ChevronDown className="w-3 h-3 rotate-180" aria-hidden="true" />
                </button>
              </div>
            ) : (
              /* Collapsed: one strip, so the form gets the screen */
              <div className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="block w-3 h-px bg-amber-600 dark:bg-amber-400 shrink-0" aria-hidden="true" />
                  <p className={`${warningText} truncate`}>Progress is not saved</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIntroOpen(true)}
                  aria-expanded={false}
                  aria-controls="application-intro"
                  className={subtleLink}
                >
                  Details
                  <ChevronDown className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {/* ── Application iframe ── */}
          <section aria-labelledby="application-heading">
            <div className="flex items-center gap-3 mb-3">
              <span className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
              <h2
                id="application-heading"
                className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
              >
                Application Form
              </h2>
            </div>

            <div className="border border-border-light dark:border-border-dark overflow-hidden">
              {isResolved ? (
                <iframe
                  title="Adoption Application"
                  width="100%"
                  className={`${frameHeight} block`}
                  src={`https://toolkit.rescuegroups.org/of/f?c=${isDark ? FORM_CODE_DARK : FORM_CODE_LIGHT}`}
                />
              ) : (
                <div
                  className={`${frameHeight} flex flex-col items-center justify-center gap-3`}
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="w-5 h-5 text-primary-light dark:text-primary-dark animate-spin" aria-hidden="true" />
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                    Loading application
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
