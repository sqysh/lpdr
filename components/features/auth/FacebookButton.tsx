'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

export function FacebookButton({ redirectTo }: { redirectTo: string }) {
  const [loading, setLoading] = useState(false)

  async function handleFacebook() {
    setLoading(true)
    await signIn('facebook', { redirect: true, redirectTo })
  }

  return (
    <motion.button
      type="button"
      onClick={handleFacebook}
      disabled={loading}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-border-light dark:border-border-dark bg-surface-light dark:bg-bg-dark hover:border-primary-light/50 dark:hover:border-primary-dark/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-60 disabled:cursor-not-allowed group"
    >
      {loading ? (
        <Loader2
          className="w-4 h-4 shrink-0 animate-spin text-muted-light dark:text-muted-dark"
          aria-hidden="true"
        />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-4 h-4 shrink-0"
          aria-hidden="true"
          fill="#1877F2"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )}
      <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-text-light dark:text-text-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors duration-200">
        {loading ? 'Redirecting...' : 'Continue with Facebook'}
      </span>
    </motion.button>
  )
}
