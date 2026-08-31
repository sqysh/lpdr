'use client'

import { useState, useMemo } from 'react'
import { Search, X, CheckCircle } from 'lucide-react'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import { IUser } from 'types/_user'
import { grantAdminAccess } from 'lib/actions/admin/user/grantAdminAccess'

type Props = {
  open: boolean
  onClose: () => void
  users: IUser[]
  onGranted: () => void
}

export function GrantAdminAccessModal({ open, onClose, users, onGranted }: Props) {
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const matches = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return users
      .filter(
        (u) =>
          u.role !== 'ADMIN' &&
          u.role !== 'SUPER_USER' &&
          [u.firstName, u.lastName, u.email].some((v) => v?.toLowerCase().includes(q))
      )
      .slice(0, 5)
  }, [users, query])

  const isValidEmail = EMAIL_REGEX.test(query.trim())
  const showPreProvisionOption = matches.length === 0 && isValidEmail

  const reset = () => {
    setQuery('')
    setSelectedUser(null)
    setResult(null)
  }

  const close = () => {
    onClose()
    reset()
  }

  const handleGrant = async (email: string) => {
    setLoading(true)
    setResult(null)

    const res = await grantAdminAccess({ email })

    setLoading(false)

    if (res.success) {
      const message = res.data?.isPending
        ? `Admin access will apply automatically the first time ${res.data.email} signs in.`
        : `${res.data?.email} is now an admin.`
      setResult({ success: true, message })
      onGranted()
      setTimeout(close, 1800)
    } else {
      setResult({ success: false, message: res.error ?? 'Something went wrong' })
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark">
              <h2 className="font-quicksand font-black text-base text-text-light dark:text-text-dark">
                Grant admin access
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5">
              {!selectedUser ? (
                <>
                  <div className="relative mb-3">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-light dark:text-muted-dark pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name or email..."
                      autoFocus
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-mono border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark"
                    />
                  </div>

                  {matches.length > 0 && (
                    <div className="border border-border-light dark:border-border-dark divide-y divide-border-light dark:divide-border-dark mb-3">
                      {matches.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSelectedUser(u)}
                          className="w-full text-left px-3 py-2.5 hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors"
                        >
                          <p className="text-xs font-semibold text-text-light dark:text-text-dark">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                            {u.email}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {showPreProvisionOption && (
                    <button
                      type="button"
                      onClick={() => handleGrant(query.trim())}
                      disabled={loading}
                      className="w-full text-left px-3 py-3 border border-dashed border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors disabled:opacity-50"
                    >
                      <p className="text-xs font-mono text-text-light dark:text-text-dark">
                        No account yet for <span className="font-bold">{query.trim()}</span>
                      </p>
                      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                        Grant admin access now — it applies automatically the first time they sign
                        in.
                      </p>
                    </button>
                  )}

                  {query.trim() && matches.length === 0 && !isValidEmail && (
                    <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
                      No matching users. Enter a full email address to pre-provision access.
                    </p>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-sm font-mono text-text-light dark:text-text-dark mb-1">
                    Make{' '}
                    <span className="font-bold">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </span>{' '}
                    an admin?
                  </p>
                  <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark mb-4">
                    {selectedUser.email}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleGrant(selectedUser.email)}
                      disabled={loading}
                      className="flex-1 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      {loading ? 'Granting...' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="px-4 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {result && (
                <p
                  className={`text-[11px] font-mono mt-4 flex items-center gap-1.5 ${result.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                >
                  {result.success && (
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                  {result.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
