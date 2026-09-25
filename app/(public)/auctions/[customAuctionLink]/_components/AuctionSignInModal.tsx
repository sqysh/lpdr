'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleButton } from 'components/features/auth/GoogleButton'
import { FacebookButton } from 'components/features/auth/FacebookButton'
import { MagicLink } from 'components/features/auth/MagicLink'
import { useAuctionUiStore } from 'stores/auction-ui.store'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function AuctionSignInModal() {
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const closeSignInModal = useAuctionUiStore((s) => s.closeSignInModal)
  const signInRedirectTo = useAuctionUiStore((s) => s.signInRedirectTo)
  const dialogRef = useRef<HTMLDivElement>(null)

  const isOpen = signInRedirectTo !== null

  const onClose = () => {
    closeSignInModal()
    setEmail('')
    setMagicLinkSent(false)
  }

  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // What a modal owes keyboard and screen reader users: focus moves in, Tab stays inside, Escape closes,
  // and focus goes back to whatever opened it. The page behind also stops scrolling under a finger
  useEffect(() => {
    if (!isOpen) return

    const opener = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // The dialog itself rather than the email field, so a phone doesn't throw its keyboard up uninvited
    dialogRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return

      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      opener?.focus?.()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* A sheet from the bottom on phones, so an open keyboard pushes it up instead of covering it; centered from sm up */}
          <motion.div
            key="modal"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auction-signin-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed z-50 inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:pb-0 bg-bg-light dark:bg-bg-dark border-t sm:border border-border-light dark:border-border-dark shadow-2xl focus:outline-none"
          >
            <div
              className="h-0.5 w-full bg-linear-to-r from-primary-light via-secondary-dark to-primary-dark dark:from-primary-dark dark:via-secondary-dark dark:to-primary-light"
              aria-hidden="true"
            />

            <div className="flex items-center justify-between gap-4 pl-5 sm:pl-6 pr-2 py-2 border-b border-border-light dark:border-border-dark">
              <h2 id="auction-signin-title" className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">
                Sign in to bid
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-11 h-11 flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {magicLinkSent ? (
              <div role="status" className="px-5 sm:px-6 py-10 text-center space-y-3">
                <div
                  className="w-12 h-12 mx-auto border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <Mail size={20} className="text-primary-light dark:text-primary-dark" />
                </div>
                <p className="font-quicksand font-black text-base text-text-light dark:text-text-dark">Check your inbox</p>
                <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                  We sent a sign-in link to <strong className="text-text-light dark:text-text-dark break-all">{email}</strong>. Tap it and
                  you&apos;ll come straight back to the auction.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMagicLinkSent(false)
                    setEmail('')
                  }}
                  className="mt-2 h-11 px-4 text-[11px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <div className="px-5 sm:px-6 py-6 space-y-4">
                <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                  You&apos;ll come straight back to the item after signing in.
                </p>

                <div className="flex flex-col gap-2">
                  <GoogleButton redirectTo={signInRedirectTo ?? '/'} />
                  <FacebookButton redirectTo={signInRedirectTo ?? '/'} />
                </div>

                <div className="flex items-center gap-2.5" aria-hidden="true">
                  <span className="flex-1 h-px bg-border-light dark:bg-border-dark" />
                  <span className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">or</span>
                  <span className="flex-1 h-px bg-border-light dark:bg-border-dark" />
                </div>

                <MagicLink email={email} redirectTo={signInRedirectTo ?? '/'} setEmail={setEmail} setSent={setMagicLinkSent} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
