'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Merge, AlertTriangle, Loader2 } from 'lucide-react'
import { mergeUsers } from 'lib/actions/super-user/mergeUsers'
import { FormField } from 'app/components/_primitives'

type Props = {
  userId: string
  userEmail: string
}

export function MergeUserSection({ userId, userEmail }: Props) {
  const router = useRouter()
  const [duplicateEmail, setDuplicateEmail] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMerge() {
    if (!duplicateEmail.trim()) return
    setLoading(true)
    setError(null)

    const result = await mergeUsers({
      primaryUserId: userId,
      duplicateEmail
    })

    setLoading(false)

    if (result.success) {
      router.push('/admin/users')
    } else {
      setError(result.error ?? 'Something went wrong.')
      setConfirm(false)
    }
  }

  return (
    <section className="border border-red-500/20 bg-red-500/5">
      <div className="px-4 py-3 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <span className="block w-3 h-px bg-red-500 shrink-0" aria-hidden="true" />
          <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-red-500">
            Merge Duplicate Accounts
          </p>
        </div>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="text-xs font-semibold text-text-light dark:text-text-dark">
          Combine two accounts made on this site
        </p>

        <div className="px-3 py-2.5 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark space-y-1.5">
          <p className="text-[10px] font-mono text-text-light dark:text-text-dark leading-relaxed">
            <span className="font-bold">This is only for accounts created on this site.</span> Since
            signing in is easy — Google, Facebook, or a magic link — a member could accidentally
            sign in with two different emails and end up with two separate accounts, each with its
            own orders, bids, or donations made after the site launched.
          </p>
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">
            This tool combines those two accounts into one. It has nothing to do with a
            member&apos;s history from the old Little Paws site — that history is restored
            automatically the first time someone signs in with the same email they used before, and
            does not require this tool at all.
          </p>
        </div>

        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">
          Enter the duplicate account&apos;s email below. All orders, bids, and payment methods from
          that account will be moved onto this one, and the duplicate account will be permanently
          deleted.
        </p>

        <div className="flex items-center gap-2 px-3 py-2.5 border border-amber-500/30 bg-amber-500/5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
          <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 leading-snug">
            This action is permanent and cannot be undone. The current account ({userEmail}) is kept
            as the primary.
          </p>
        </div>

        <FormField
          id="duplicateEmail"
          name="duplicateEmail"
          label="Duplicate account email"
          type="email"
          value={duplicateEmail}
          onChange={(e) => {
            setDuplicateEmail(e.target.value)
            setConfirm(false)
            setError(null)
          }}
          placeholder="duplicate@email.com"
        />

        {error && (
          <p role="alert" className="font-mono text-[11px] text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {!confirm ? (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            disabled={!duplicateEmail.trim()}
            className="w-full py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center gap-2">
              <Merge size={12} aria-hidden="true" /> Merge Accounts
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-center text-red-500">
              Are you sure? This will permanently delete the account for {duplicateEmail}.
            </p>
            <button
              type="button"
              onClick={handleMerge}
              disabled={loading}
              className="w-full py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-red-500 text-white hover:bg-red-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" /> Merging...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Merge size={12} aria-hidden="true" /> Confirm Merge
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="w-full py-2 text-[10px] font-mono text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
