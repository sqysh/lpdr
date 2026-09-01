'use client'

import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { IPaymentMethod } from 'types/_payment-method.types'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getInitials } from 'lib/utils/user.utils'
import { DonateForm } from './_components'
import Picture from 'components/_common/Picture'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  savedCards: IPaymentMethod[]
  userName: { firstName?: string; lastName?: string }
  isAuthed: boolean
  email?: string | null
  userImage?: string | null
}

export default function PublicDonateClient({
  savedCards,
  userName,
  isAuthed,
  email,
  userImage
}: Props) {
  const router = useRouter()
  const [navigatingToMyPack, setNavigatingToMyPack] = useState(false)

  const handleMyPackClick = () => {
    setNavigatingToMyPack(true)
    router.push('/my-pack')
  }

  return (
    <>
      {/* ── Thin sticky header ── */}
      <header className="sticky top-0 z-50 bg-topbar-light/95 dark:bg-topbar-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <div className="max-w-5xl mx-auto w-full px-4 1150:px-0 h-12 flex items-center justify-between">
          {/* Back to home */}
          <Link
            href="/"
            aria-label="Back to Little Paws Dachshund Rescue home"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Home
          </Link>

          {/* Signed-in indicator — links to My Pack */}
          {email && (
            <button
              type="button"
              onClick={handleMyPackClick}
              disabled={navigatingToMyPack}
              aria-label="Go to My Pack"
              className="flex items-center gap-2 min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded disabled:opacity-70"
            >
              <div
                aria-hidden="true"
                className="shrink-0 w-7 h-7 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 group-hover:border-primary-light dark:group-hover:border-primary-dark flex items-center justify-center overflow-hidden transition-colors"
              >
                {navigatingToMyPack ? (
                  <Loader2
                    className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark animate-spin"
                    aria-hidden="true"
                  />
                ) : userImage ? (
                  <Picture
                    priority={true}
                    src={userImage}
                    alt=""
                    className="w-full h-full object-cover"
                    unoptimized={false}
                  />
                ) : (
                  <span className="text-[9px] font-mono font-bold text-primary-light dark:text-primary-dark uppercase">
                    {getInitials(userName?.firstName, userName?.lastName)}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-on-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                {navigatingToMyPack ? 'Loading...' : 'My Pack'}
              </span>
            </button>
          )}
        </div>
      </header>

      <main className="min-h-dvh px-4 1150:px-0 pt-12 sm:pt-16 pb-24 sm:pb-32 bg-bg-light dark:bg-bg-dark flex flex-col gap-y-20 sm:gap-y-28">
        <div className="max-w-5xl mx-auto w-full">
          {/* ── Page header ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
                aria-hidden="true"
              />
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                One-Time Donation
              </p>
            </div>
            <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-5">
              Make a{' '}
              <span className="font-light text-muted-light dark:text-muted-dark">Difference</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-light dark:text-on-dark leading-relaxed max-w-2xl">
              Every dollar goes directly to rescue, vetting, and care for our dachshunds.
            </p>
          </motion.div>

          {/* ── Two-column grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-12 items-start">
            {/* ── LEFT PANEL ── */}
            <motion.aside
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.5}
              className="lg:sticky lg:top-8 space-y-8"
              aria-label="About Little Paws Dachshund Rescue"
            >
              {/* Mission */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="block w-5 h-px bg-primary-light dark:bg-primary-dark"
                    aria-hidden="true"
                  />
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                    Our Mission
                  </p>
                </div>
                <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                  Little Paws Dachshund Rescue is a volunteer-run nonprofit dedicated to saving
                  dachshunds and dachshund mixes from shelters, surrenders, and neglect — giving
                  every long dog a second chance at a loving forever home.
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />

              {/* Impact stats */}
              <div>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-5">
                  Your Impact
                </p>
                <dl className="space-y-5">
                  {[
                    { stat: '1,900+', label: 'Dogs rescued since 2012' },
                    { stat: '100%', label: 'Volunteer-operated' },
                    { stat: 'ME→FL', label: 'Rescue network up & down the East Coast' }
                  ].map(({ stat, label }) => (
                    <div key={stat} className="flex items-baseline gap-4">
                      <dt className="font-quicksand font-black text-2xl text-primary-light dark:text-primary-dark tabular-nums shrink-0">
                        {stat}
                      </dt>
                      <dd className="text-[11px] font-mono text-muted-light dark:text-muted-dark leading-snug">
                        {label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Divider */}
              <div className="h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />

              {/* What your donation covers */}
              <div>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-4">
                  Where It Goes
                </p>
                <ul className="space-y-3" aria-label="What your donation covers">
                  {[
                    { amount: '$25', desc: 'covers a vet wellness visit' },
                    { amount: '$50', desc: 'funds heartworm treatment' },
                    { amount: '$100', desc: 'sponsors a full rescue intake' }
                  ].map(({ amount, desc }) => (
                    <li key={amount} className="flex items-start gap-3">
                      <span className="font-quicksand font-black text-sm text-primary-light dark:text-primary-dark shrink-0 mt-px">
                        {amount}
                      </span>
                      <span className="text-[11px] font-mono text-muted-light dark:text-muted-dark leading-snug">
                        {desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* ── Logged-in indicator ── */}
              {email && userName?.firstName && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
                  <div
                    className="h-px bg-border-light dark:bg-border-dark mb-8"
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-3">
                    {/* Avatar initials circle */}
                    <div
                      aria-hidden="true"
                      className="shrink-0 w-8 h-8  bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 flex items-center justify-center"
                    >
                      <span className="text-[10px] font-mono font-bold text-primary-light dark:text-primary-dark uppercase">
                        {userName?.firstName
                          ? userName?.firstName
                              .split(' ')
                              .map((n: string) => n[0])
                              .slice(0, 2)
                              .join('')
                          : email?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                        Signed in as
                      </p>
                      <p className="text-xs font-mono text-text-light dark:text-text-dark truncate">
                        {email}
                      </p>
                    </div>
                    {/* Active dot */}
                    <div
                      aria-hidden="true"
                      className="shrink-0 ml-auto w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark"
                    />
                  </div>
                </motion.div>
              )}
            </motion.aside>

            {/* ── RIGHT PANEL — the form ── */}
            <DonateForm
              savedCards={savedCards}
              userName={userName}
              isAuthed={isAuthed}
              email={email}
            />
          </div>
          {/* end two-column grid */}
        </div>
      </main>
    </>
  )
}
