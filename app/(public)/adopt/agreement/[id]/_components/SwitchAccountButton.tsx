'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

export function SwitchAccountButton({ returnTo }: { returnTo: string }) {
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true)
        // Back to this same link, where the sign-in step shows, so they can use the right account
        void signOut({ redirectTo: returnTo })
      }}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border-light dark:border-border-dark text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
      Sign out and use a different email
    </button>
  )
}
