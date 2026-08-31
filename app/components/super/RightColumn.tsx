import { AdminUser } from 'lib/actions/super-user/getAdminUsers'
import { ManagedUser } from 'lib/actions/super-user/getManagedUsers'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { searchUser } from 'lib/actions/super-user/searchUser'
import { updateUserStatus } from 'lib/actions/super-user/updateUserStatus'
import { PanelHeader } from './PanelHeader'
import { Search, Shield } from 'lucide-react'
import { LogEntry } from 'lib/actions/super-user/getAuditLogs'

export function RightColumn({
  adminUsers,
  managedUsers: initialManaged,
  auditLogs
}: {
  adminUsers: AdminUser[]
  managedUsers: ManagedUser[]
  auditLogs: LogEntry[]
}) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [acting, setActing] = useState(false)
  const [managed, setManaged] = useState(initialManaged)
  const [modError, setModError] = useState<string | null>(null)

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setNotFound(false)
    setSearchResult(null)
    setModError(null)
    const res = await searchUser(query.trim())
    if (!res.success || !res.data) setNotFound(true)
    else setSearchResult(res.data)
    setSearching(false)
  }

  async function handleStatus(userId: string, status: 'SUSPENDED' | 'TERMINATED' | 'ACTIVE') {
    setActing(true)
    setModError(null)
    const res = await updateUserStatus(userId, status)
    if (!res.success) {
      setModError(res.error ?? 'Failed')
      setActing(false)
      return
    }
    if (status === 'ACTIVE') {
      setManaged((prev) => prev.filter((u) => u.id !== userId))
    } else {
      const existing = managed.find((u) => u.id === userId)
      if (existing) {
        setManaged((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)))
      } else if (searchResult) {
        setManaged((prev) => [
          ...prev,
          {
            id: userId,
            name: searchResult.name,
            email: searchResult.email,
            status,
            actedAt: 'Just now',
            reason: null
          }
        ])
      }
    }
    if (searchResult?.id === userId) setSearchResult((p: any) => (p ? { ...p, status } : null))
    setActing(false)
  }

  return (
    <div className="flex flex-col border-l border-border-light dark:border-border-dark w-64 shrink-0 overflow-hidden">
      {/* Admin Roles */}
      <PanelHeader label="Admin Roles" />
      <div className="divide-y divide-border-light dark:divide-border-dark border-b border-border-light dark:border-border-dark max-h-44 overflow-y-auto">
        {adminUsers.map((admin) => (
          <div key={admin.id} className="flex items-center gap-2 px-3 py-2">
            <div
              className="w-6 h-6 flex items-center justify-center font-mono text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: admin.avatarColor }}
              aria-hidden="true"
            >
              {admin.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase text-text-light dark:text-text-dark truncate">
                {admin.name}
              </p>
              <p className="font-mono text-[8px] text-muted-light dark:text-muted-dark truncate">
                {admin.email}
              </p>
            </div>
            <span
              className={`shrink-0 ${admin.role === 'SUPER_USER' ? 'text-primary-light dark:text-primary-dark' : 'text-muted-light dark:text-muted-dark'}`}
            >
              {admin.role === 'SUPER_USER' ? (
                <Shield size={10} aria-label="Superuser" />
              ) : (
                <span className="font-mono text-[8px] uppercase">Admin</span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* User Moderation */}
      <PanelHeader label="User Moderation" />
      <div className="px-3 py-2 border-b border-border-light dark:border-border-dark shrink-0">
        <div className="flex gap-1.5 mb-2">
          <div className="relative flex-1">
            <Search
              size={9}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="email"
              placeholder="Search email..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setNotFound(false)
                setSearchResult(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              inputMode="email"
              className="w-full pl-6 pr-2 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark font-mono text-[9px] focus:outline-none focus:border-primary-light dark:focus:border-primary-dark transition-colors"
            />
          </div>
          <button
            onClick={search}
            disabled={!query.trim() || searching}
            className="px-2 py-1 font-mono text-[8px] tracking-widest uppercase bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-40 transition-colors focus:outline-none"
          >
            {searching ? '...' : 'Go'}
          </button>
        </div>

        {modError && <p className="font-mono text-[8px] text-red-500 mb-1">{modError}</p>}
        {notFound && (
          <p className="font-mono text-[8px] text-muted-light dark:text-muted-dark">
            No user found.
          </p>
        )}

        <AnimatePresence>
          {searchResult && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="min-w-0">
                  <p className="font-mono text-[9px] text-text-light dark:text-text-dark truncate">
                    {searchResult.name}
                  </p>
                  <p className="font-mono text-[8px] text-muted-light dark:text-muted-dark truncate">
                    {searchResult.email}
                  </p>
                </div>
                <span
                  className={`font-mono text-[8px] uppercase font-bold shrink-0 ${
                    searchResult.status === 'ACTIVE'
                      ? 'text-green-500'
                      : searchResult.status === 'SUSPENDED'
                        ? 'text-amber-500'
                        : 'text-red-500'
                  }`}
                >
                  {searchResult.status}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {searchResult.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleStatus(searchResult.id, 'SUSPENDED')}
                    disabled={acting}
                    className="px-1.5 py-0.5 font-mono text-[8px] uppercase border border-amber-500/40 text-amber-500 hover:bg-amber-500/5 disabled:opacity-40 transition-colors focus:outline-none"
                  >
                    Suspend
                  </button>
                )}
                {searchResult.status !== 'TERMINATED' && (
                  <button
                    onClick={() => handleStatus(searchResult.id, 'TERMINATED')}
                    disabled={acting}
                    className="px-1.5 py-0.5 font-mono text-[8px] uppercase border border-red-500/40 text-red-500 hover:bg-red-500/5 disabled:opacity-40 transition-colors focus:outline-none"
                  >
                    Terminate
                  </button>
                )}
                {searchResult.status !== 'ACTIVE' && (
                  <button
                    onClick={() => handleStatus(searchResult.id, 'ACTIVE')}
                    disabled={acting}
                    className="px-1.5 py-0.5 font-mono text-[8px] uppercase border border-green-500/40 text-green-500 hover:bg-green-500/5 disabled:opacity-40 transition-colors focus:outline-none"
                  >
                    Reinstate
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suspended / Terminated list */}
      <div className="overflow-y-auto border-b border-border-light dark:divide-border-dark max-h-32 divide-y divide-border-light">
        {managed.length === 0 ? (
          <p className="font-mono text-[9px] text-muted-light dark:text-muted-dark px-3 py-2">
            No restricted users.
          </p>
        ) : (
          managed.map((u) => (
            <div key={u.id} className="flex items-center gap-2 px-3 py-1.5">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[9px] text-text-light dark:text-text-dark truncate">
                  {u.email}
                </p>
                <p
                  className={`font-mono text-[8px] font-bold uppercase ${u.status === 'SUSPENDED' ? 'text-amber-500' : 'text-red-500'}`}
                >
                  {u.status}
                </p>
              </div>
              <button
                onClick={() => handleStatus(u.id, 'ACTIVE')}
                className="shrink-0 px-1.5 py-0.5 font-mono text-[8px] uppercase border border-green-500/40 text-green-500 hover:bg-green-500/5 transition-colors focus:outline-none"
              >
                Reinstate
              </button>
            </div>
          ))
        )}
      </div>

      {/* Audit Log */}
      <PanelHeader label="Audit Log" />
      <div className="flex-1 overflow-y-auto divide-y divide-border-light dark:divide-border-dark">
        {auditLogs.map((log) => (
          <div key={log.id} className="px-3 py-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className={`font-mono text-[8px] uppercase font-bold ${
                  log.level === 'ERROR'
                    ? 'text-red-500'
                    : log.level === 'WARN'
                      ? 'text-amber-500'
                      : 'text-primary-light dark:text-primary-dark'
                }`}
              >
                {log.level}
              </span>
              <span className="font-mono text-[8px] text-muted-light dark:text-muted-dark">
                {log.ts}
              </span>
            </div>
            <p className="font-mono text-[8px] text-text-light dark:text-text-dark leading-snug">
              {log.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
