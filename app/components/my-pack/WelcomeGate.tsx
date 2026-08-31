'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { TalkingDachshund } from 'app/components/_common/TalkingDachshund'
import { markWelcomeSeen } from 'lib/actions/my-pack/markWelcomeSeen'

export function WelcomeGate() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(false)

  let show = session?.user && !session.user.hasSeenWelcome && !dismissed
  const firstName = session?.user?.name?.split(' ')[0] ?? null
  show = true
  const handleClose = async () => {
    setDismissed(true)
    await markWelcomeSeen()
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-heading"
        >
          <motion.div
            className="relative w-full max-w-md bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-6 py-10 sm:px-8 sm:py-12 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8">
              <TalkingDachshund
                message={
                  firstName ? `Welcome to your pack, ${firstName}!` : 'Welcome to your pack!'
                }
                bubbleSide="top"
                size={200}
                typeSpeed={45}
                startDelay={500}
              />
            </div>

            <h2
              id="welcome-heading"
              className="text-sm text-muted-light dark:text-muted-dark leading-relaxed mb-8 max-w-xs"
            >
              Your account is all set. Explore your pack, manage your donations, and keep track of
              everything in one place.
            </h2>

            <button
              onClick={handleClose}
              className="w-full bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono font-black tracking-[0.25em] uppercase py-3.5 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Let&apos;s explore
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
