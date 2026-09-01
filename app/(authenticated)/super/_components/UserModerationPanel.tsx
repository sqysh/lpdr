'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShieldOff, X, AlertTriangle } from 'lucide-react'
import { searchUser } from 'lib/actions/super-user/searchUser'
import { updateUserStatus } from 'lib/actions/super-user/updateUserStatus'

interface ManagedUser {
  id: string
  name: string
  email: string
  status: 'SUSPENDED' | 'TERMINATED'
  actedAt: string
  reason?: string | null
}

interface UserSearchResult {
  id: string
  name: string
  email: string
  status: string
  role: string
}

interface UserModerationPanelProps {
  suspended: ManagedUser[]
  terminated: ManagedUser[]
}

function ConfirmDialog({
  action,
  user,
  onConfirm,
  onCancel
}: {
  action: 'suspend' | 'terminate'
  user: UserSearchResult
  onConfirm: (reason: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 mb-4"
    >
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-text-light dark:text-text-dark">
            {action === 'suspend' ? 'Suspend' : 'Terminate'} {user.name}?
          </p>
          <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark mt-0.5">
            {user.email}
          </p>
        </div>
      </div>
      <input
        type="text"
        placeholder="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full px-3 py-2 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-mono text-[10px] tracking-[0.05em] focus:outline-none focus:border-primary-light dark:focus:border-primary-dark mb-3"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(reason)}
          className={`px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase text-white transition-colors focus:outline-none ${
            action === 'suspend' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {action === 'suspend' ? 'Suspend' : 'Terminate'}
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  )
}

export default function UserModerationPanel({
  suspended: initialSuspended,
  terminated: initialTerminated
}: UserModerationPanelProps) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<UserSearchResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [confirm, setConfirm] = useState<'suspend' | 'terminate' | null>(null)
  const [acting, setActing] = useState(false)
  const [suspended, setSuspended] = useState<ManagedUser[]>(initialSuspended)
  const [terminated, setTerminated] = useState<ManagedUser[]>(initialTerminated)
  const [error, setError] = useState<string | null>(null)

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setNotFound(false)
    setResult(null)
    setError(null)
    setConfirm(null)

    const res = await searchUser(query.trim())
    if (!res.success || !res.data) {
      setNotFound(true)
    } else {
      setResult(res.data)
    }
    setSearching(false)
  }

  async function handleConfirm(reason: string) {
    if (!result || !confirm) return
    setActing(true)
    setError(null)

    try {
      if (confirm === 'suspend') {
        const res = await updateUserStatus(result.id, 'SUSPENDED', reason)
        if (!res.success) {
          setError('Failed to suspend user')
          return
        }
        setSuspended((prev) => [
          ...prev,
          {
            id: result.id,
            name: result.name,
            email: result.email,
            status: 'SUSPENDED',
            actedAt: 'Just now',
            reason: reason || null
          }
        ])
        setResult((prev) => (prev ? { ...prev, status: 'SUSPENDED' } : null))
      } else {
        const res = await updateUserStatus(result.id, 'TERMINATED', reason)
        if (!res.success) {
          setError('Failed to terminate user')
          return
        }
        setTerminated((prev) => [
          ...prev,
          {
            id: result.id,
            name: result.name,
            email: result.email,
            status: 'TERMINATED',
            actedAt: 'Just now',
            reason: reason || null
          }
        ])
        setSuspended((prev) => prev.filter((u) => u.id !== result.id))
        setResult((prev) => (prev ? { ...prev, status: 'TERMINATED' } : null))
      }
      setConfirm(null)
    } finally {
      setActing(false)
    }
  }

  async function handleReinstate(userId: string) {
    setError(null)
    const res = await updateUserStatus(userId, 'ACTIVE')
    if (!res.success) {
      setError('Failed to reinstate user')
      return
    }
    setSuspended((prev) => prev.filter((u) => u.id !== userId))
    setTerminated((prev) => prev.filter((u) => u.id !== userId))
    if (result?.id === userId) setResult((prev) => (prev ? { ...prev, status: 'ACTIVE' } : null))
  }

  const isActive = result?.status === 'ACTIVE'
  const isSuspended = result?.status === 'SUSPENDED'
  const isTerminated = result?.status === 'TERMINATED'

  return (
    <div>
      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="email"
            placeholder="Search by email..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setNotFound(false)
              setResult(null)
              setConfirm(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            inputMode="email"
            className="w-full pl-8 pr-3 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-mono text-[10px] tracking-[0.05em] focus:outline-none focus:border-primary-light dark:focus:border-primary-dark transition-colors"
          />
        </div>
        <button
          onClick={search}
          disabled={!query.trim() || searching}
          className="px-4 py-2 font-mono text-[9px] tracking-[0.15em] uppercase bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none"
        >
          {searching ? '...' : 'Search'}
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-2 border-l-2 border-red-500 bg-red-500/5 px-3 py-2 mb-4"
          >
            <span className="font-mono text-[10px] text-red-500">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500/60 hover:text-red-500 focus:outline-none"
            >
              <X size={11} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Not found */}
      <AnimatePresence>
        {notFound && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[10px] tracking-widest text-muted-light dark:text-muted-dark mb-4"
          >
            No user found with that email.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-border-light dark:border-border-dark p-4 mb-4"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono text-[10px] tracking-widest uppercase text-text-light dark:text-text-dark">
                    {result.name}
                  </span>
                  {/* <Badge variant={result.status === 'ACTIVE' ? 'success' : result.status === 'SUSPENDED' ? 'warn' : 'danger'}>{result.status}</Badge>
                  <Badge variant="muted">{result.role}</Badge> */}
                </div>
                <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark">
                  {result.email}
                </p>
              </div>
            </div>

            {/* Confirm dialog */}
            <AnimatePresence>
              {confirm && (
                <ConfirmDialog
                  action={confirm}
                  user={result}
                  onConfirm={handleConfirm}
                  onCancel={() => setConfirm(null)}
                />
              )}
            </AnimatePresence>

            {/* Action buttons */}
            {!confirm && (
              <div className="flex gap-2 flex-wrap">
                {(isActive || isSuspended) && !isTerminated && (
                  <button
                    onClick={() => setConfirm('terminate')}
                    disabled={acting}
                    className="px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase border border-red-500/40 text-red-500 hover:bg-red-500/5 disabled:opacity-40 transition-colors focus:outline-none"
                  >
                    <ShieldOff size={10} className="inline mr-1" aria-hidden="true" />
                    Terminate
                  </button>
                )}
                {isActive && (
                  <button
                    onClick={() => setConfirm('suspend')}
                    disabled={acting}
                    className="px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase border border-amber-500/40 text-amber-500 hover:bg-amber-500/5 disabled:opacity-40 transition-colors focus:outline-none"
                  >
                    Suspend
                  </button>
                )}
                {(isSuspended || isTerminated) && (
                  <button
                    onClick={() => handleReinstate(result.id)}
                    disabled={acting}
                    className="px-3 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase border border-green-500/40 text-green-500 hover:bg-green-500/5 disabled:opacity-40 transition-colors focus:outline-none"
                  >
                    Reinstate
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suspended list */}
      {suspended.length > 0 && (
        <div className="mb-4">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-amber-500 mb-2">
            Suspended — {suspended.length}
          </p>
          <div className="flex flex-col divide-y divide-border-light dark:divide-border-dark">
            {suspended.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.05em] text-text-light dark:text-text-dark truncate">
                    {u.email}
                  </p>
                  <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark">
                    {u.actedAt}
                    {u.reason ? ` · ${u.reason}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleReinstate(u.id)}
                  className="shrink-0 px-2.5 py-1 font-mono text-[9px] tracking-widest uppercase border border-green-500/40 text-green-500 hover:bg-green-500/5 transition-colors focus:outline-none"
                >
                  Reinstate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminated list */}
      {terminated.length > 0 && (
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-red-500 mb-2">
            Terminated — {terminated.length}
          </p>
          <div className="flex flex-col divide-y divide-border-light dark:divide-border-dark">
            {terminated.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="font-mono text-[10px] tracking-[0.05em] text-text-light dark:text-text-dark truncate">
                    {u.email}
                  </p>
                  <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark">
                    {u.actedAt}
                    {u.reason ? ` · ${u.reason}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleReinstate(u.id)}
                  className="shrink-0 px-2.5 py-1 font-mono text-[9px] tracking-widest uppercase border border-green-500/40 text-green-500 hover:bg-green-500/5 transition-colors focus:outline-none"
                >
                  Reinstate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {suspended.length === 0 && terminated.length === 0 && !result && !notFound && (
        <p className="font-mono text-[10px] tracking-widest text-muted-light dark:text-muted-dark">
          No suspended or terminated users.
        </p>
      )}
    </div>
  )
}
