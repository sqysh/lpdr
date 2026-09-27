'use client'

import { SyntheticEvent, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FormField, FormError, SubmitButton } from 'components/_primitives'
import { updateUserName } from 'lib/actions/my-pack/updateUserName'

/**
 * Asks email sign-in users for their name once, since the account started with one guessed from their
 * email address. Dismissing it only lasts until the next visit, so it asks again later rather than never
 */
export function NamePrompt() {
  const { data, update } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Not over sign-in or payment pages, where it would interrupt what they came to do
  const quietHere = pathname.startsWith('/auth') || pathname.startsWith('/checkout') || pathname.includes('/winner/')
  if (!data?.user?.needsName || dismissed || quietHere) return null

  const onSave = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!firstName.trim()) return setError('Please enter your first name.')

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
    <div
      role="dialog"
      aria-labelledby="name-prompt-title"
      className="fixed inset-x-0 bottom-0 z-150 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-96 bg-bg-light dark:bg-bg-dark border-t sm:border border-border-light dark:border-border-dark shadow-2xl pb-[env(safe-area-inset-bottom)]"
    >
      <form onSubmit={onSave} className="p-5 space-y-4">
        <div className="space-y-1">
          <h2 id="name-prompt-title" className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">
            What should we call you?
          </h2>
          <p className="text-sm text-muted-light dark:text-muted-dark">Your name appears on receipts and when you win.</p>
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
        <div className="flex items-center gap-3">
          <SubmitButton loading={saving} isValid={!!firstName.trim()} label="Save" />
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 min-h-11 px-3 text-[11px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
          >
            Later
          </button>
        </div>
      </form>
    </div>
  )
}
