'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export function TopBar() {
  const session = useSession()
  const role = session?.data?.user?.role
  const isAdmin = role === 'ADMIN' || role === 'SUPER_USER'
  const isSuperUser = role === 'SUPER_USER'
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = () => {
    setSigningOut(true)
    signOut({ redirectTo: '/auth/login' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="max-w-5xl mx-auto px-4 h-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Home
        </Link>

        <div className="flex items-center gap-4">
          {isSuperUser && (
            <Link
              href="/super"
              className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="square"
                aria-hidden="true"
              >
                <path d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z" />
              </svg>
              Super
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="square"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </Link>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signingOut ? (
              <>
                Signing out...
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              </>
            ) : (
              <>
                Sign Out
                <svg
                  viewBox="0 0 24 24"
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="square"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
