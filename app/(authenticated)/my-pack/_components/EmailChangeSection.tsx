'use client'

import { useState } from 'react'
import { Check, Loader2, Pencil, X } from 'lucide-react'
import { FormField } from 'components/_primitives'
import { requestEmailChange } from 'lib/actions/my-pack/email-change/requestEmailChange'
import { motion } from 'framer-motion'
type Props = {
  currentEmail: string
}

export function EmailChangeSection({ currentEmail }: Props) {
  const [editing, setEditing] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCancel() {
    setEditing(false)
    setEmail('')
    setError(null)
  }

  async function handleSubmit() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const result = await requestEmailChange(email.trim().toLowerCase())
    setLoading(false)

    if (result.success) {
      setSent(true)
      setEditing(false)
      setEmail('')
    } else {
      setError(result.error ?? 'Something went wrong.')
    }
  }

  if (sent) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <Check className="w-3 h-3 text-emerald-500 shrink-0" aria-hidden="true" />
        <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-emerald-500">
          Verification sent — check your new email
        </p>
      </div>
    )
  }

  return (
    <div className="mt-1">
      {!editing ? (
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs text-muted-light dark:text-muted-dark">{currentEmail}</p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Change email address"
            className="text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <Pencil className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <motion.div
          key="name-form"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="mt-2 space-y-2 max-w-sm"
        >
          <FormField
            id="new-email"
            name="new-email"
            label="New email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            placeholder="new@email.com"
            error={error ?? undefined}
            autoComplete="email"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!email.trim() || loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono tracking-[0.2em] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                'Send verification'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-2 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-[10px] font-mono tracking-[0.2em] uppercase hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
