'use client'

import { fetchLogs } from 'lib/actions/super-user/fetchLogs'
import { LEVEL_STYLES, LEVELS } from 'lib/constants/log.constants'
import { formatDate } from 'lib/utils/date.utils'
import { useState, useTransition, useCallback } from 'react'
import { Level, LogRow } from 'types/log.types'

const LEVEL_ACTIVE_BG: Record<Level, string> = {
  all: '',
  info: 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark',
  warn: 'bg-secondary-light/10 dark:bg-secondary-dark/10 text-secondary-light dark:text-secondary-dark',
  error: 'bg-red-500/10 dark:bg-red-400/10 text-red-600 dark:text-red-400'
}

type Props = {
  initialData: LogRow[]
  initialTotal: number
}

export function SuperLogsClient({ initialData, initialTotal }: Props) {
  const [logs, setLogs] = useState<LogRow[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [level, setLevel] = useState<Level | ''>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const load = useCallback((opts: { level?: Level; search?: string; page?: number }) => {
    startTransition(async () => {
      const res = await fetchLogs({
        level: opts.level || undefined,
        search: opts.search || undefined,
        page: opts.page ?? 0
      })
      if (!res.success) {
        setError(res.error)
        return
      }
      setLogs(res.data)
      setTotal(res.total)
      setError(null)
    })
  }, [])

  function handleLevel(v: Level | '') {
    setLevel(v)
    setPage(0)
    load({ level: v as Level, search })
  }

  function handleSearch(v: string) {
    setSearch(v)
    setPage(0)
    load({ level: level as Level, search: v })
  }

  function handlePage(p: number) {
    setPage(p)
    load({ level: level as Level, search, page: p })
  }

  const totalPages = Math.ceil(total / 100)

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border-light dark:border-border-dark">
        <div className="flex gap-1">
          <button
            onClick={() => handleLevel('')}
            className={`px-3 py-1 text-f10 font-mono tracking-widest uppercase transition-colors ${
              level === ''
                ? 'bg-text-light dark:bg-text-dark text-bg-light dark:text-bg-dark'
                : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
            }`}
          >
            All
          </button>
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => handleLevel(l)}
              className={`px-3 py-1 text-f10 font-mono tracking-widest uppercase transition-colors ${
                level === l
                  ? LEVEL_ACTIVE_BG[l]
                  : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search message or user ID..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="ml-auto w-72 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-3 py-1.5 text-f10 font-mono text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark focus:outline-none focus:border-primary-light dark:focus:border-primary-dark"
        />

        <span className="text-f10 font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
          {total.toLocaleString()} logs
        </span>

        {isPending && (
          <span className="text-f10 font-mono text-muted-light dark:text-muted-dark animate-pulse">
            loading...
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-3 bg-red-500/10 dark:bg-red-400/10 text-red-600 dark:text-red-400 font-mono text-f10 border-b border-red-500/20 dark:border-red-400/20">
          {error}
        </div>
      )}

      {/* Header row */}
      <div className="grid grid-cols-[160px_80px_1fr_220px] px-6 py-2 border-b border-border-light dark:border-border-dark text-f10 font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
        <span>Timestamp</span>
        <span>Level</span>
        <span>Message</span>
        <span>User</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 && !isPending && (
          <div className="px-6 py-12 text-center font-mono text-f10 text-muted-light dark:text-muted-dark tracking-widest uppercase">
            No logs found
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id}>
            <button
              onClick={() => setExpanded(expanded === log.id ? null : log.id)}
              className={`w-full grid grid-cols-[160px_80px_1fr_220px] px-6 py-2.5 border-b border-border-light/50 dark:border-border-dark/50 text-left transition-colors hover:bg-surface-light dark:hover:bg-surface-dark ${
                expanded === log.id ? 'bg-surface-light dark:bg-surface-dark' : ''
              }`}
            >
              <span className="font-mono text-f10 text-muted-light dark:text-muted-dark tabular-nums">
                {formatDate(log.createdAt, true)}
              </span>
              <span
                className={`font-mono text-f10 uppercase tracking-widest ${
                  LEVEL_STYLES[log.level as Level] ?? 'text-on-dark'
                }`}
              >
                {log.level}
              </span>
              <span className="font-mono text-f10 text-text-light dark:text-on-dark truncate pr-4">
                {log.message}
              </span>
              <span className="font-mono text-f10 text-muted-light dark:text-muted-dark truncate">
                {log.userId ?? '—'}
              </span>
            </button>

            {/* Expanded metadata */}
            {expanded === log.id && log.metadata && (
              <div className="px-6 py-3 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
                <pre className="text-f10 font-mono text-text-light dark:text-on-dark whitespace-pre-wrap break-all">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-4 px-6 py-3 border-t border-border-light dark:border-border-dark">
          <button
            disabled={page === 0}
            onClick={() => handlePage(page - 1)}
            className="text-f10 font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark disabled:opacity-20 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-f10 font-mono text-muted-light dark:text-muted-dark">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => handlePage(page + 1)}
            className="text-f10 font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark disabled:opacity-20 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
