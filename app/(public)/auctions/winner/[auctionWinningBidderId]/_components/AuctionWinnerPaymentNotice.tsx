'use client'

import { useState } from 'react'
import Link, { useLinkStatus } from 'next/link'
import { signOut } from 'next-auth/react'
import { AlertCircle, Loader2 } from 'lucide-react'

const CTA =
  'btn-shimmer relative overflow-hidden inline-flex items-center gap-2 px-5 py-3 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors text-f10 font-mono tracking-eyebrow uppercase font-black disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

const QUIET =
  'inline-flex items-center gap-1.5 text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

type Props = {
  code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'WRONG_ACCOUNT' | 'ERROR' | null
  belongsTo?: string
  winningBidderId: string
}

/** useLinkStatus only reports on a navigation, so it has to live inside the Link. */
function LinkLabel({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useLinkStatus()

  return (
    <>
      {pending && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : label}
    </>
  )
}

function SignOutButton({ returnTo }: { returnTo: string }) {
  // signOut navigates away, so nothing resets this. It stays spinning until the page changes,
  // which is the honest state: the request is still in flight.
  const [signingOut, setSigningOut] = useState(false)

  return (
    <button
      type="button"
      disabled={signingOut}
      aria-busy={signingOut}
      onClick={() => {
        setSigningOut(true)
        signOut({ callbackUrl: returnTo })
      }}
      className={CTA}
    >
      {signingOut && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
      {signingOut ? 'Signing out' : 'Sign out and switch accounts'}
    </button>
  )
}

export function WinnerPaymentNotice({ code, belongsTo, winningBidderId }: Props) {
  const returnTo = `/auctions/winner/${winningBidderId}`

  const { title, body, action } = {
    WRONG_ACCOUNT: {
      title: 'This link belongs to a different account',
      body: `You are signed in as someone else. This payment was set up for ${belongsTo ?? 'another account'}. Sign out and back in with that email to pay for the items.`,
      action: <SignOutButton returnTo={returnTo} />
    },
    NOT_FOUND: {
      title: 'We could not find this payment',
      body: 'The link may be out of date, or the auction may have been reset. If you won an item and have not been able to pay, reply to the email we sent you and we will sort it out.',
      action: null
    },
    UNAUTHENTICATED: {
      title: 'Sign in to pay',
      body: 'Sign in with the email address that received the payment request, and we will bring you straight back here.',
      action: (
        <Link href={`/auth/login?callbackUrl=${encodeURIComponent(returnTo)}`} className={CTA}>
          <LinkLabel label="Sign in" pendingLabel="Opening" />
        </Link>
      )
    },
    ERROR: {
      title: 'Something went wrong',
      body: 'We could not load this payment just now. Try again in a moment, and if it keeps happening, reply to the email we sent you.',
      action: null
    }
  }[code ?? 'ERROR']

  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-20">
        <div className="border border-border-light dark:border-border-dark p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-amber-500 shrink-0" aria-hidden="true" />
            <h1 className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">{title}</h1>
          </div>

          <p className="text-xs font-nunito text-muted-light dark:text-muted-dark leading-relaxed">{body}</p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            {action}
            <Link href="/my-pack" className={QUIET}>
              <LinkLabel label="Go to My Pack" pendingLabel="Opening" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
