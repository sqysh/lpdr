'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'

export function SignedInRow() {
  const session = useSession()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  if (!session.data?.user?.id) return null

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ redirect: false })
    router.refresh()
    setSigningOut(false)
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="flex items-center gap-3 px-4 py-3">
      <div
        className="shrink-0 w-6 h-6 flex items-center justify-center border bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light/30 dark:border-primary-dark/30"
        aria-hidden="true"
      >
        <span className="text-[9px] font-mono font-bold uppercase text-primary-light dark:text-primary-dark">
          {session.data?.user?.email?.[0]}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">Signed in as</p>
        <p className="text-xs font-mono truncate text-text-light dark:text-text-dark">{session.data?.user?.email}</p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="shrink-0 ml-auto text-[9px] font-mono tracking-[0.15em] uppercase whitespace-nowrap transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        {signingOut ? 'Signing out…' : 'Not you? Sign out'}
      </button>
    </motion.div>
  )
}
