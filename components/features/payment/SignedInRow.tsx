'use client'

import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { useThemeStore } from 'stores/theme.store'

export function SignedInRow({ isDark }: { isDark?: boolean }) {
  const session = useSession()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const storeDark = useThemeStore((s) => s.isDark)
  const dark = isDark ?? storeDark

  if (!session.data?.user?.id) return null

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ redirect: false })
    router.refresh()
    setSigningOut(false)
  }

  const c = {
    avatarBox: dark
      ? 'bg-primary-dark/10 border-primary-dark/30'
      : 'bg-primary-light/10 border-primary-light/30',
    avatarText: dark ? 'text-primary-dark' : 'text-primary-light',
    label: dark ? 'text-muted-dark' : 'text-muted-light',
    email: dark ? 'text-text-dark' : 'text-text-light',
    signOut: dark
      ? 'text-muted-dark hover:text-primary-dark focus-visible:ring-primary-dark'
      : 'text-muted-light hover:text-primary-light focus-visible:ring-primary-light'
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={1}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div
        className={`shrink-0 w-6 h-6 flex items-center justify-center border ${c.avatarBox}`}
        aria-hidden="true"
      >
        <span className={`text-[9px] font-mono font-bold uppercase ${c.avatarText}`}>
          {session.data?.user?.email?.[0]}
        </span>
      </div>
      <div className="min-w-0">
        <p className={`text-[10px] font-mono tracking-[0.15em] uppercase ${c.label}`}>
          Signed in as
        </p>
        <p className={`text-xs font-mono truncate ${c.email}`}>{session.data?.user?.email}</p>
      </div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className={`shrink-0 ml-auto text-[9px] font-mono tracking-[0.15em] uppercase whitespace-nowrap transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 ${c.signOut}`}
      >
        {signingOut ? 'Signing out…' : 'Not you? Sign out'}
      </button>
    </motion.div>
  )
}
