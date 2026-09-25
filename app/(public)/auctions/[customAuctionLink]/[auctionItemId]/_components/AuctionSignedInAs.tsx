'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Loader2, LogOut, User } from 'lucide-react'

/** Shows whose account a bid will be placed from, next to where bids are placed, with a way to switch */
export function AuctionSignedInAs() {
  const { data } = useSession()
  const [signingOut, setSigningOut] = useState(false)

  const user = data?.user
  if (!user) return null

  const name = user.name || user.email

  const onSignOut = async () => {
    setSigningOut(true)
    // No redirect: they stay on this item, and useRefreshOnSignOut reloads it as the signed-out version
    await signOut({ redirect: false })
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <p className="min-w-0 flex items-center gap-2 text-[11px] font-mono text-muted-light dark:text-muted-dark">
        <User size={12} className="shrink-0" aria-hidden="true" />
        <span className="truncate">
          Bidding as <strong className="text-text-light dark:text-text-dark">{name}</strong>
        </span>
      </p>
      <button
        type="button"
        onClick={onSignOut}
        disabled={signingOut}
        className="shrink-0 min-h-9 inline-flex items-center gap-1.5 px-2 text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        {signingOut ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : <LogOut size={12} aria-hidden="true" />}
        {signingOut ? 'Signing out' : 'Sign out'}
      </button>
    </div>
  )
}
