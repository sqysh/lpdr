'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function VerifyButton({ callback }: { callback: string }) {
  const [pending, setPending] = useState(false)

  return (
    <a
      href={callback}
      onClick={() => setPending(true)}
      aria-disabled={pending}
      className={`flex w-full items-center justify-center gap-2 py-3 text-[10px] font-mono font-black tracking-[0.25em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 ${
        pending
          ? 'pointer-events-none bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
          : 'bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white'
      }`}
    >
      {pending ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="block w-3 h-3 border-2 border-current/30 border-t-current rounded-full"
            aria-hidden="true"
          />
          Signing in
        </>
      ) : (
        <>
          <ArrowRight size={12} aria-hidden="true" />
          Continue to sign in
        </>
      )}
    </a>
  )
}
