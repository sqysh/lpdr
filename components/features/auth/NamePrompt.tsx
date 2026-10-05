'use client'

import { SyntheticEvent, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FormField, FormError, SubmitButton } from 'components/_primitives'
import { updateUserName } from 'lib/actions/my-pack/updateUserName'

/**
 * Required right after sign-in for anyone without a confirmed first and last name: magic link
 * accounts, and older accounts whose name was guessed from their email address. It can't be
 * dismissed, since receipts, auction wins and adoption paperwork all need a real name
 */
export function NamePrompt() {
  const { data, update } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Only the sign-in pages, where it would block the magic link and provider redirects
  const quietHere = pathname.startsWith('/auth')
  const open = Boolean(data?.user?.needsName) && !quietHere

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    formRef.current?.querySelector('input')?.focus()
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  const isValid = Boolean(firstName.trim() && lastName.trim())

  const onSave = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!firstName.trim()) return setError('Please enter your first name.')
    if (!lastName.trim()) return setError('Please enter your last name.')

    setSaving(true)
    setError(null)
    const result = await updateUserName({ firstName: firstName.trim(), lastName: lastName.trim() })
    setSaving(false)

    if (!result.success) return setError(result.error ?? "That didn't save. Please try again.")

    // Fetches the session again, so needsName clears and the prompt closes everywhere
    await update()
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center bg-black/60" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-prompt-title"
        aria-describedby="name-prompt-desc"
        className="w-full sm:w-96 bg-bg-light dark:bg-bg-dark border-t sm:border border-border-light dark:border-border-dark shadow-2xl pb-[env(safe-area-inset-bottom)]"
      >
        <form ref={formRef} onSubmit={onSave} className="p-5 space-y-4" noValidate>
          <div className="space-y-1">
            <h2 id="name-prompt-title" className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">
              What&apos;s your name?
            </h2>
            <p id="name-prompt-desc" className="text-sm text-muted-light dark:text-muted-dark">
              It goes on your receipts, auction wins and adoption paperwork.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="np-first"
              name="firstName"
              label="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <FormField
              id="np-last"
              name="lastName"
              label="Last name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <FormError error={error} />
          <SubmitButton loading={saving} isValid={isValid} label="Continue" />
        </form>
      </div>
    </div>
  )
}
