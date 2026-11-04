'use client'

import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { IPaymentMethod } from 'types/payment-method.types'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getInitials } from 'lib/utils/user.utils'
import { MemorialForm, type MemorialFormSettings } from './_components/MemorialForm'
import { LinkBody } from 'components/_common/LinkBody'
import { MyPackAvatar } from 'components/_common/MyPackAvatar'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSignOut.hook'

type Props = {
  settings: MemorialFormSettings
  savedCards: IPaymentMethod[]
  userName: { firstName?: string; lastName?: string }
  isAuthed: boolean
  email?: string | null
  userImage?: string | null
  userId?: string | null
}

export default function RainbowBridgeRememberClient({ settings, savedCards, userName, isAuthed, email, userImage, userId }: Props) {
  useRefreshOnSignOut(isAuthed)

  const steps = [
    { n: '01', desc: "Enter your dog's name and choose a gift" },
    { n: '02', desc: 'Receive a keepsake card with their name carried by a butterfly over the Rainbow Bridge' },
    {
      n: '03',
      desc: settings.requireApproval
        ? 'Their butterfly joins the others on our Rainbow Bridge after a quick review'
        : 'Their butterfly joins the others on our Rainbow Bridge'
    }
  ]

  return (
    <>
      <header className="sticky top-(--staging-bar-height,0px) z-50 bg-topbar-light/95 dark:bg-topbar-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <div className="max-w-5xl mx-auto w-full px-4 1150:px-0 h-12 flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to Little Paws Dachshund Rescue home"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-eyebrow uppercase text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
          >
            <LinkBody icon={<ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />} label="Home" spinnerClass="w-3.5 h-3.5" />
          </Link>

          {email && (
            <Link
              href="/my-pack"
              aria-label="Go to My Pack"
              className="flex items-center gap-2 min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
            >
              <MyPackAvatar userImage={userImage} initials={getInitials(userName?.firstName, userName?.lastName)} />
            </Link>
          )}
        </div>
      </header>

      <main className="min-h-dvh px-4 1150:px-0 pt-12 sm:pt-16 pb-24 sm:pb-32 bg-bg-light dark:bg-bg-dark flex flex-col gap-y-20 sm:gap-y-28">
        <div className="max-w-5xl mx-auto w-full">
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="block w-8 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
              <p className="text-xs font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">Rainbow Bridge</p>
            </div>
            <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-5">
              In Loving <span className="font-light text-muted-light dark:text-muted-dark">Memory</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-light dark:text-on-dark leading-relaxed max-w-2xl">
              Honor a dog you loved and lost. Your gift helps a dachshund in our care today, and their name joins the others on our Rainbow
              Bridge.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-12 items-start">
            <motion.aside
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.5}
              className="lg:sticky lg:top-14 space-y-8"
              aria-label="About Rainbow Bridge memorials"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="block w-5 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
                  <p className="text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">How It Works</p>
                </div>
                <ol className="space-y-4">
                  {steps.map(({ n, desc }) => (
                    <li key={n} className="flex items-baseline gap-4">
                      <span className="font-quicksand font-black text-lg text-primary-light dark:text-primary-dark tabular-nums shrink-0">
                        {n}
                      </span>
                      <span className="text-[11px] font-mono text-muted-light dark:text-muted-dark leading-snug">{desc}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />

              <div>
                <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-4">Where It Goes</p>
                <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                  Every memorial gift goes to the rescue, vetting, and care of the dachshunds waiting for their own families, so the love
                  you shared keeps going.
                </p>
              </div>

              <div className="h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />

              <Link
                href="/rainbow-bridge"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <LinkBody icon={<ArrowRight className="w-3 h-3" aria-hidden="true" />} label="Visit the Rainbow Bridge" iconAfter />
              </Link>

              {email && userName?.firstName && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
                  <div className="h-px bg-border-light dark:bg-border-dark mb-8" aria-hidden="true" />
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="shrink-0 w-8 h-8 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 flex items-center justify-center"
                    >
                      <span className="text-[10px] font-mono font-bold text-primary-light dark:text-primary-dark uppercase">
                        {getInitials(userName.firstName, userName.lastName)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark">Signed in as</p>
                      <p className="text-xs font-mono text-text-light dark:text-text-dark truncate">{email}</p>
                    </div>
                    <div aria-hidden="true" className="shrink-0 ml-auto w-1.5 h-1.5 bg-primary-light dark:bg-primary-dark" />
                  </div>
                </motion.div>
              )}
            </motion.aside>
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.75}>
              <MemorialForm
                settings={settings}
                savedCards={savedCards}
                userName={userName}
                isAuthed={isAuthed}
                email={email ?? null}
                userId={userId ?? null}
              />
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
