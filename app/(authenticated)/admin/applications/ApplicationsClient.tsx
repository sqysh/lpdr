'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ChevronRight, ClipboardList, Clock, Hourglass, Inbox, Info, Loader2, Search, UserCheck } from 'lucide-react'
import type { getApplications } from 'lib/actions/admin/application/getApplications'
import { CLOSED_STATUSES, STATUS_LABELS, type ApplicationView } from 'lib/application/application.constants'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { formatDate } from 'lib/utils/date.utils'
import { NEXT_STEP, STATUS_STYLE, StageBar } from './_lib/status'

type ApplicationRow = NonNullable<Awaited<ReturnType<typeof getApplications>>['data']>[number]

const COL_COUNT = 6
const STALE_DAYS = 7
const DAY = 86_400_000

const VIEWS: ApplicationView[] = ['unassigned', 'mine', 'open', 'waiting', 'closed', 'all']

const VIEW_LABELS: Record<ApplicationView, string> = {
  unassigned: 'Unassigned',
  mine: 'Mine',
  open: 'Open',
  waiting: 'Waiting for a dog',
  closed: 'Closed',
  all: 'All'
}

// One line under the tabs so nobody has to guess what a tab means
const VIEW_HELP: Record<ApplicationView, string> = {
  unassigned: 'New applications nobody has picked up yet. Open one and assign yourself to start reviewing.',
  mine: 'Applications you are reviewing. Anything quiet for a week is flagged.',
  open: 'Every application still in progress, whoever has it.',
  waiting: 'Approved adopters waiting to be matched with a dog. These stay open until they adopt or cancel.',
  closed: 'Adopted, approved fosters and cancelled applications. Kept for the record.',
  all: 'Everything, newest first.'
}

const EMPTY: Record<ApplicationView, string> = {
  unassigned: 'Nothing waiting for a reviewer',
  mine: 'Nothing assigned to you',
  open: 'No open applications',
  waiting: 'No approved adopters waiting',
  closed: 'No closed applications',
  all: 'No applications yet'
}

const isClosed = (a: ApplicationRow) => CLOSED_STATUSES.includes(a.status)
const needsReviewer = (a: ApplicationRow) => a.status === 'SUBMITTED' && !a.assignedTo
const daysSince = (date: string | Date) => Math.floor((Date.now() - new Date(date).getTime()) / DAY)
// Waiting for a dog can take months, so only active reviews go stale
const isStale = (a: ApplicationRow) =>
  !isClosed(a) && !needsReviewer(a) && a.status !== 'APPROVED_WAITING' && daysSince(a.updatedAt) >= STALE_DAYS

function inView(a: ApplicationRow, view: ApplicationView, userId: string | null) {
  switch (view) {
    case 'unassigned':
      return needsReviewer(a)
    case 'mine':
      return !!userId && a.assignedTo?.id === userId && !isClosed(a)
    case 'open':
      return !isClosed(a)
    case 'waiting':
      return a.status === 'APPROVED_WAITING'
    case 'closed':
      return isClosed(a)
    case 'all':
      return true
  }
}

function ago(date: string | Date) {
  const days = daysSince(date)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const fullName = (p: { firstName: string | null; lastName: string | null } | null) => [p?.firstName, p?.lastName].filter(Boolean).join(' ')

export function ApplicationsClient({
  applications,
  error,
  userId
}: {
  applications: ApplicationRow[]
  error: string | null
  userId: string | null
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [openingId, setOpeningId] = useState<string | null>(null)

  const counts = useMemo(
    () =>
      Object.fromEntries(VIEWS.map((v) => [v, applications.filter((a) => inView(a, v, userId)).length])) as Record<ApplicationView, number>,
    [applications, userId]
  )

  // Land where the work is: new applications first, then your own, then everything open
  const [view, setView] = useState<ApplicationView>(() => (counts.unassigned > 0 ? 'unassigned' : counts.mine > 0 ? 'mine' : 'open'))

  const staleMine = useMemo(() => applications.filter((a) => inView(a, 'mine', userId) && isStale(a)).length, [applications, userId])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    // Search looks everywhere, so a name typed on the wrong tab is still found
    const filtered = applications.filter((a) =>
      q ? [fullName(a.user), a.user.email, a.dogName ?? ''].some((s) => s.toLowerCase().includes(q)) : inView(a, view, userId)
    )
    // Anything that needs someone floats up: no reviewer first, then gone quiet, then newest
    const rank = (a: ApplicationRow) => (needsReviewer(a) ? 0 : isStale(a) ? 1 : 2)
    return [...filtered].sort((x, y) => rank(x) - rank(y))
  }, [applications, view, userId, query])

  const open = (id: string) => {
    setOpeningId(id)
    startTransition(() => router.push(`/admin/applications/${id}`))
  }

  const statButton =
    'text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

  const searching = query.trim().length > 0

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Applications" count={{ value: applications.length, noun: 'application' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Each tile is a shortcut to its tab */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button type="button" onClick={() => setView('unassigned')} className={statButton}>
            <Stat icon={Inbox} label="Needs a Reviewer" value={String(counts.unassigned)} accent={counts.unassigned > 0} />
          </button>
          <button type="button" onClick={() => setView('mine')} className={statButton}>
            <Stat icon={UserCheck} label="Assigned to Me" value={String(counts.mine)} accent={staleMine > 0} />
          </button>
          <button type="button" onClick={() => setView('open')} className={statButton}>
            <Stat icon={ClipboardList} label="In Progress" value={String(counts.open)} />
          </button>
          <button type="button" onClick={() => setView('waiting')} className={statButton}>
            <Stat icon={Hourglass} label="Waiting for a Dog" value={String(counts.waiting)} />
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-center gap-2 px-4 py-3 border border-red-500/30 bg-red-500/5 text-xs font-mono text-red-600 dark:text-red-400"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {staleMine > 0 && view !== 'mine' && (
          <button
            type="button"
            onClick={() => setView('mine')}
            className="flex w-full items-center gap-2 px-4 py-3 border border-amber-500/40 bg-amber-500/5 text-left text-xs font-mono text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {staleMine} of your applications {staleMine === 1 ? 'has' : 'have'} had no activity for a week or more. Show them
          </button>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <AdminFilterTabs
              options={VIEWS}
              value={view}
              onChange={(v: ApplicationView) => {
                setView(v)
                setQuery('')
              }}
              counts={counts}
              labels={VIEW_LABELS}
              label="Filter applications"
            />
            <label className="relative w-full sm:w-72">
              <span className="sr-only">Search all applications</span>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-light dark:text-muted-dark"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email or dog"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark focus:outline-none focus:border-primary-light dark:focus:border-primary-dark"
              />
            </label>
          </div>

          <p className="flex items-start gap-2 text-[10px] font-mono text-muted-light dark:text-muted-dark">
            <Info className="w-3 h-3 mt-px shrink-0" aria-hidden="true" />
            {searching ? `Searching every application. ${rows.length} match${rows.length === 1 ? '' : 'es'}.` : VIEW_HELP[view]}
          </p>
        </div>

        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Applications, the ones needing attention first</caption>
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {['Applicant', 'Dog', 'Status and next step', 'Reviewer', 'Submitted', ''].map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-2.5 text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark font-normal whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={COL_COUNT} className="px-4 py-12 text-center">
                    <ClipboardList className="w-5 h-5 mx-auto mb-2 text-muted-light/50 dark:text-muted-dark/50" aria-hidden="true" />
                    <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                      {searching ? `Nothing matches "${query.trim()}"` : EMPTY[view]}
                    </p>
                  </td>
                </tr>
              )}

              {rows.map((a) => {
                const name = fullName(a.user)
                const reviewer = fullName(a.assignedTo)
                const isMine = !!userId && a.assignedTo?.id === userId
                const flagged = needsReviewer(a)
                const stale = isStale(a)
                const quietDays = daysSince(a.updatedAt)

                return (
                  <tr
                    key={a.id}
                    onClick={() => open(a.id)}
                    className={`group cursor-pointer transition-colors ${
                      flagged
                        ? 'bg-sky-500/5 hover:brightness-95 dark:hover:brightness-125'
                        : stale
                          ? 'bg-amber-500/5 hover:brightness-95 dark:hover:brightness-125'
                          : 'hover:bg-bg-light dark:hover:bg-bg-dark'
                    }`}
                  >
                    <td
                      className={`px-4 py-3 min-w-0 max-w-64 border-l-[3px] ${
                        flagged ? 'border-l-sky-500' : stale ? 'border-l-amber-500' : 'border-l-transparent'
                      }`}
                    >
                      <Link
                        href={`/admin/applications/${a.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block text-xs font-nunito font-bold text-text-light dark:text-text-dark truncate hover:text-primary-light dark:hover:text-primary-dark focus:outline-none focus-visible:underline"
                      >
                        {name || a.user.email}
                      </Link>
                      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">{a.user.email}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.type === 'FOSTER' ? (
                        <span className="inline-flex px-2 py-0.5 border border-border-light dark:border-border-dark text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                          Foster
                        </span>
                      ) : (
                        <p className="text-xs font-nunito text-text-light dark:text-text-dark">{a.dogName ?? 'Any dog'}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 border text-[9px] font-mono tracking-eyebrow uppercase ${STATUS_STYLE[a.status]}`}
                      >
                        {STATUS_LABELS[a.status]}
                      </span>
                      {flagged ? (
                        <p className="flex items-center gap-1.5 mt-1 text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">
                          <span className="relative flex w-1.5 h-1.5" aria-hidden="true">
                            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
                            <span className="relative w-1.5 h-1.5 rounded-full bg-current" />
                          </span>
                          Needs a reviewer
                        </p>
                      ) : stale ? (
                        <p className="flex items-center gap-1.5 mt-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                          Quiet for {quietDays} days
                        </p>
                      ) : (
                        <p className="mt-1 text-[10px] font-mono text-muted-light dark:text-muted-dark">{NEXT_STEP[a.status]}</p>
                      )}
                      <StageBar status={a.status} />
                    </td>

                    <td className="px-4 py-3 text-xs font-nunito whitespace-nowrap">
                      {isMine ? (
                        <span className="inline-flex px-2 py-0.5 border border-primary-light/40 dark:border-primary-dark/40 text-[9px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
                          You
                        </span>
                      ) : reviewer ? (
                        <span className="text-text-light dark:text-text-dark">{reviewer}</span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">Nobody yet</span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-mono text-muted-light dark:text-muted-dark">{formatDate(a.submittedAt, true)}</p>
                      <p className="text-[10px] font-mono text-muted-light/70 dark:text-muted-dark/70">{ago(a.submittedAt)}</p>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {isPending && openingId === a.id ? (
                        <Loader2 className="w-3.5 h-3.5 inline animate-spin text-primary-light dark:text-primary-dark" aria-hidden="true" />
                      ) : (
                        <ChevronRight
                          className="w-3.5 h-3.5 inline text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
                          aria-hidden="true"
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
