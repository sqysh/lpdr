'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import Link from 'next/link'

const COOKIE_NAME = 'lpdr_cookie_consent'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

export function CookieConsentBanner() {
  // Always false on both server and first client render — this guarantees
  // the initial markup matches exactly, avoiding a hydration mismatch.
  // We only decide whether to show the banner after mount, once `document`
  // is safely available and hydration has already completed.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getCookie(COOKIE_NAME)) {
      // document.cookie is only available client-side; this cannot be
      // derived during render without risking a hydration mismatch between
      // server (no document) and client (cookie may already exist).
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    setCookie(COOKIE_NAME, 'accepted', COOKIE_MAX_AGE)
    setVisible(false)
  }

  const handleDismiss = () => {
    setCookie(COOKIE_NAME, 'dismissed', COOKIE_MAX_AGE)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-0 left-0 right-0 z-150 border-t border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark"
          role="region"
          aria-label="Cookie notice"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Cookie
                className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed">
                We use cookies to keep you signed in, remember your cart, and understand how
                visitors use the site.{' '}
                <Link
                  href="/privacy-policy"
                  className="text-primary-light dark:text-primary-dark hover:underline underline-offset-2"
                >
                  Learn more
                </Link>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss cookie notice"
                className="p-2 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
