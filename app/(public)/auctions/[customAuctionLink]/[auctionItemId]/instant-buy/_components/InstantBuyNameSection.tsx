import { FormField } from 'app/components/_primitives'
import { Loader2 } from 'lucide-react'

type NameErrors = {
  firstName?: string
  lastName?: string
}

type Props = {
  firstName: string
  lastName: string
  hasName: boolean
  savingName: boolean
  nameErrors: NameErrors
  showCancel: boolean
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

export function InstantBuyNameSection({
  firstName,
  lastName,
  hasName,
  savingName,
  nameErrors,
  showCancel,
  onFirstNameChange,
  onLastNameChange,
  onEdit,
  onCancel,
  onSave
}: Props) {
  return (
    <section
      aria-label={hasName ? 'Your name' : 'Enter your name'}
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      {hasName ? (
        <>
          <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <p className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">Name</p>
            <button
              type="button"
              onClick={onEdit}
              className="text-f10 uppercase tracking-[0.2em] text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus-visible:outline-none"
            >
              Edit
            </button>
          </div>
          <div className="px-4 py-3">
            <p className="font-lato text-sm text-text-light dark:text-text-dark">
              {firstName} {lastName}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
            <h2 className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">Your Name</h2>
            <p className="font-lato text-xs text-muted-light dark:text-muted-dark mt-0.5">
              Required to complete your purchase.
            </p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="firstName"
                name="firstName"
                label="First Name"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                autoComplete="given-name"
                placeholder="Jane"
                error={nameErrors.firstName}
              />
              <FormField
                id="lastName"
                name="lastName"
                label="Last Name"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                autoComplete="family-name"
                placeholder="Doe"
                error={nameErrors.lastName}
              />
            </div>
            <div className="flex gap-3">
              {showCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 px-4 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-f10 uppercase tracking-[0.25em] hover:text-text-light dark:hover:text-text-dark transition-colors focus-visible:outline-none"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={!firstName.trim() || !lastName.trim() || savingName}
                className="flex-1 py-2.5 px-4 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-f10 uppercase tracking-[0.25em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {savingName ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    Saving...
                  </span>
                ) : (
                  'Save Name'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
