'use client'

import { useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, Check, FileSignature, History, Loader2, Mail, MapPin, MessageSquare, Phone, UserCheck } from 'lucide-react'
import type { ApplicationStatus } from '@prisma/client'
import type { getApplicationById } from 'lib/actions/admin/application/getApplicationById'
import { updateApplication } from 'lib/actions/admin/application/updateApplication'
import { addApplicationNote } from 'lib/actions/admin/application/addApplicationNote'
import { STATUS_LABELS, STATUSES_FOR } from 'lib/application/application.constants'
import { ADOPTION_APPLICATION, type Question } from 'lib/constants/adoption-application.constants'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { formatDate } from 'lib/utils/date.utils'
import { NEXT_STEP, STATUS_STYLE, StageBar } from '../_lib/status'

type Data = NonNullable<Awaited<ReturnType<typeof getApplicationById>>['data']>
type Event = Data['application']['events'][number]
type Person = { id?: string; firstName: string | null; lastName: string | null; email?: string | null } | null

const eyebrow = 'text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark'
const card = 'border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark'
const field =
  'w-full px-3 py-2 text-xs font-mono border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus:border-primary-light dark:focus:border-primary-dark disabled:opacity-60'
const primaryButton =
  'inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-light dark:bg-primary-dark text-white text-f10 font-mono tracking-eyebrow uppercase hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'
const quietButton =
  'inline-flex items-center justify-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

const fullName = (p: Person) => [p?.firstName, p?.lastName].filter(Boolean).join(' ')

function shown(q: Question, answers: Record<string, string>) {
  if (!q.showIf) return true
  const want = q.showIf.equals
  const have = answers[q.showIf.id]
  return Array.isArray(want) ? want.includes(have) : have === want
}

function Panel({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className={card}>
      <h2 className={`flex items-center gap-2 px-4 py-2.5 border-b border-border-light dark:border-border-dark ${eyebrow}`}>
        {icon}
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  )
}

function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="flex items-center gap-1.5 text-[10px] font-mono text-red-600 dark:text-red-400">
      <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

/** One line per event, written as a sentence so anyone can read the history */
function describe(e: Event, nameOf: (id: string | null | undefined) => string) {
  const who = fullName(e.actor) || e.actor?.email || 'Someone'
  const meta = (e.meta ?? {}) as Record<string, string | null | undefined>
  switch (e.kind) {
    case 'SUBMITTED':
      return 'Application submitted'
    case 'STATUS_CHANGED':
      return `${who} moved it from ${e.fromStatus ? STATUS_LABELS[e.fromStatus] : 'nothing'} to ${e.toStatus ? STATUS_LABELS[e.toStatus] : 'nothing'}`
    case 'ASSIGNED':
      if (!meta.to) return `${who} unassigned it`
      if (meta.to === e.actor?.id) return `${who} took it`
      return `${who} assigned it to ${nameOf(meta.to)}`
    case 'NOTE':
      return `${who} added a note`
    case 'EMAIL_SENT':
      return `${who} emailed the applicant${meta.subject ? `: ${meta.subject}` : ''}`
    case 'DOG_CHANGED':
      return `${who} changed the dog${meta.from || meta.to ? ` from ${meta.from ?? 'none'} to ${meta.to ?? 'none'}` : ''}`
  }
}

export function ApplicationDetailClient({ application: app, otherApplications, legacy, reviewers, viewerId }: Data) {
  const [isPending, startTransition] = useTransition()
  const [busy, setBusy] = useState<'status' | 'assign' | 'note' | null>(null)
  const [error, setError] = useState<{ on: 'status' | 'assign' | 'note'; message: string } | null>(null)

  const [status, setStatus] = useState<ApplicationStatus>(app.status)
  const [assignee, setAssignee] = useState<string>(app.assignedTo?.id ?? '')
  const [note, setNote] = useState('')

  const answers = (app.answers ?? {}) as Record<string, string>
  const applicant = fullName(app.user) || app.user.email
  const isMine = app.assignedTo?.id === viewerId
  // A new application that gets a reviewer has been read, so it moves on to references in the same step
  const movesToReferences = app.status === 'SUBMITTED'

  const nameOf = (id: string | null | undefined) => {
    const r = reviewers.find((p) => p.id === id)
    return r ? fullName(r) : 'someone'
  }

  const run = (
    on: 'status' | 'assign' | 'note',
    action: () => Promise<{ success: boolean; error?: string | null }>,
    after?: () => void
  ) => {
    setBusy(on)
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (!result.success) setError({ on, message: result.error ?? 'Something went wrong. Please try again.' })
      else after?.()
      setBusy(null)
    })
  }

  const assign = (to: string | null) =>
    run('assign', () =>
      updateApplication({
        applicationId: app.id,
        assignedToId: to,
        ...(to && movesToReferences ? { status: 'REFERENCE_CHECK' } : {})
      })
    )

  const knownIds = new Set(ADOPTION_APPLICATION.flatMap((s) => s.questions.map((q) => q.id)))
  const extraAnswers = Object.entries(answers).filter(([id, v]) => !knownIds.has(id) && v)

  const address = app.user.address as { addressLine1?: string; city?: string; state?: string; zipPostalCode?: string } | null
  const addressLine = address
    ? [address.addressLine1, [address.city, address.state].filter(Boolean).join(', '), address.zipPostalCode].filter(Boolean).join(' ')
    : ''

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title={applicant} breadcrumbs={[{ label: 'Applications', href: '/admin/applications' }]} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        {/* The summary strip: what this is, where it stands, and what happens next */}
        <div className={`${card} flex flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3`}>
          <div className="min-w-0 mr-4">
            <p className={eyebrow}>Applicant</p>
            <p className="font-quicksand font-bold text-xl text-text-light dark:text-text-dark truncate">{applicant}</p>
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">{app.user.email}</p>
          </div>
          <div>
            <p className={eyebrow}>{app.type === 'FOSTER' ? 'Foster application' : 'Adoption application'}</p>
            <p className="text-sm font-nunito font-bold text-text-light dark:text-text-dark">
              {app.type === 'FOSTER' ? 'Foster' : (app.dogName ?? 'Any dog')}
            </p>
          </div>
          <div>
            <p className={eyebrow}>Status</p>
            <span
              className={`inline-flex mt-0.5 px-2 py-0.5 border text-[9px] font-mono tracking-eyebrow uppercase ${STATUS_STYLE[app.status]}`}
            >
              {STATUS_LABELS[app.status]}
            </span>
            <StageBar status={app.status} />
          </div>
          <div>
            <p className={eyebrow}>Next step</p>
            <p className="text-xs font-mono text-text-light dark:text-text-dark">{NEXT_STEP[app.status]}</p>
          </div>
          <div>
            <p className={eyebrow}>Reviewer</p>
            <p className="text-xs font-nunito text-text-light dark:text-text-dark">
              {isMine ? 'You' : fullName(app.assignedTo) || <span className="text-muted-light dark:text-muted-dark">Nobody yet</span>}
            </p>
          </div>
          <div>
            <p className={eyebrow}>Submitted</p>
            <p className="text-xs font-mono text-text-light dark:text-text-dark">{formatDate(app.submittedAt, true)}</p>
          </div>
          {app.adoptionAgreement && (
            <Link href={`/admin/adoption-agreements/${app.adoptionAgreement.id}`} className={`${quietButton} ml-auto`}>
              <FileSignature className="w-3.5 h-3.5" aria-hidden="true" />
              Adoption agreement
            </Link>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
          {/* Left: the application itself */}
          <div className="space-y-6 min-w-0">
            {ADOPTION_APPLICATION.map((section) => {
              const questions = section.questions.filter((q) => q.type !== 'content' && shown(q, answers))
              if (!questions.length) return null
              return (
                <Panel key={section.id} title={section.title}>
                  <dl className="divide-y divide-border-light dark:divide-border-dark -my-3">
                    {questions.map((q) => {
                      const value = answers[q.id]?.toString().trim()
                      return (
                        <div key={q.id} className="py-3 grid gap-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6">
                          <dt className="text-[11px] font-mono text-muted-light dark:text-muted-dark">{q.label}</dt>
                          <dd className="text-sm font-nunito text-text-light dark:text-text-dark whitespace-pre-wrap wrap-break-word">
                            {!value ? (
                              <span className="text-xs font-mono text-muted-light/70 dark:text-muted-dark/70">No answer</span>
                            ) : q.type === 'agree' ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                Agreed
                              </span>
                            ) : (
                              value
                            )}
                          </dd>
                        </div>
                      )
                    })}
                  </dl>
                </Panel>
              )
            })}

            {extraAnswers.length > 0 && (
              <Panel title="Other answers">
                <p className="mb-3 text-[10px] font-mono text-muted-light dark:text-muted-dark">
                  Questions from an older version of the form ({app.formVersion}).
                </p>
                <dl className="space-y-3">
                  {extraAnswers.map(([id, value]) => (
                    <div key={id}>
                      <dt className="text-[11px] font-mono text-muted-light dark:text-muted-dark">{id}</dt>
                      <dd className="text-sm font-nunito text-text-light dark:text-text-dark whitespace-pre-wrap">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            )}
          </div>

          {/* Right: the work. First on a phone, and sticks beside the answers on desktop */}
          <aside className="order-first lg:order-0 space-y-6 lg:sticky lg:top-6">
            <Panel title="Reviewer" icon={<UserCheck className="w-3 h-3" aria-hidden="true" />}>
              <div className="space-y-3">
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  disabled={isPending}
                  aria-label="Reviewer"
                  className={field}
                >
                  <option value="">Nobody</option>
                  {reviewers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {fullName(r)}
                      {r.id === viewerId ? ' (you)' : ''}
                    </option>
                  ))}
                </select>
                {movesToReferences && (
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                    Assigning a reviewer moves it to {STATUS_LABELS.REFERENCE_CHECK}.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => assign(assignee || null)}
                    disabled={isPending || assignee === (app.assignedTo?.id ?? '')}
                    className={primaryButton}
                  >
                    {busy === 'assign' && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                    {app.assignedTo && !assignee ? 'Unassign' : 'Assign'}
                  </button>
                  {!isMine && viewerId && (
                    <button
                      type="button"
                      onClick={() => {
                        setAssignee(viewerId)
                        assign(viewerId)
                      }}
                      disabled={isPending}
                      className={quietButton}
                    >
                      Take it myself
                    </button>
                  )}
                </div>
                <ErrorLine message={error?.on === 'assign' ? error.message : null} />
              </div>
            </Panel>

            <Panel title="Status">
              <div className="space-y-3">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  disabled={isPending}
                  aria-label="Status"
                  className={field}
                >
                  {STATUSES_FOR[app.type].map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => run('status', () => updateApplication({ applicationId: app.id, status }))}
                  disabled={isPending || status === app.status}
                  className={primaryButton}
                >
                  {busy === 'status' && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                  Update status
                </button>
                <ErrorLine message={error?.on === 'status' ? error.message : null} />
              </div>
            </Panel>

            <Panel title="Applicant">
              <ul className="space-y-2 text-xs font-mono text-text-light dark:text-text-dark">
                <li className="flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-muted-light dark:text-muted-dark" aria-hidden="true" />
                  <a href={`mailto:${app.user.email}`} className="truncate hover:text-primary-light dark:hover:text-primary-dark">
                    {app.user.email}
                  </a>
                </li>
                {(app.user.phone || answers.cellPhone) && (
                  <li className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-muted-light dark:text-muted-dark" aria-hidden="true" />
                    <a
                      href={`tel:${app.user.phone || answers.cellPhone}`}
                      className="hover:text-primary-light dark:hover:text-primary-dark"
                    >
                      {app.user.phone || answers.cellPhone}
                    </a>
                  </li>
                )}
                {(addressLine || answers.address) && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-px shrink-0 text-muted-light dark:text-muted-dark" aria-hidden="true" />
                    <span>{addressLine || [answers.address, answers.city, answers.state, answers.zip].filter(Boolean).join(', ')}</span>
                  </li>
                )}
              </ul>
            </Panel>

            {(otherApplications.length > 0 || legacy.length > 0) && (
              <Panel title="Applied before" icon={<History className="w-3 h-3" aria-hidden="true" />}>
                <ul className="space-y-3">
                  {otherApplications.map((o) => (
                    <li key={o.id}>
                      <Link href={`/admin/applications/${o.id}`} className="group flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block text-xs font-nunito font-bold text-text-light dark:text-text-dark group-hover:text-primary-light dark:group-hover:text-primary-dark">
                            {o.type === 'FOSTER' ? 'Foster' : (o.dogName ?? 'Any dog')}
                          </span>
                          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                            {formatDate(o.submittedAt, true)}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 px-2 py-0.5 border text-[9px] font-mono tracking-eyebrow uppercase ${STATUS_STYLE[o.status]}`}
                        >
                          {STATUS_LABELS[o.status]}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {legacy.map((l) => {
                    const byAccount = l.userId === app.user.id
                    const byEmail = !!l.email && l.email.toLowerCase() === app.user.email.toLowerCase()
                    return (
                      <li key={l.id} className="flex items-start justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block text-xs font-nunito font-bold text-text-light dark:text-text-dark">
                            RescueGroups #{l.rescueGroupsFormId}
                          </span>
                          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                            {formatDate(l.submittedAt, true)}
                            {!byAccount && !byEmail && (
                              <span className="ml-1.5 text-amber-600 dark:text-amber-400">Matched by name only, check it is them</span>
                            )}
                          </span>
                        </span>
                        <span className="shrink-0 px-2 py-0.5 border border-zinc-400/40 text-[9px] font-mono tracking-eyebrow uppercase text-zinc-500">
                          {l.status}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </Panel>
            )}

            <Panel title="Notes and activity" icon={<MessageSquare className="w-3 h-3" aria-hidden="true" />}>
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  placeholder="Add a note for the team. The applicant never sees these."
                  aria-label="New note"
                  className={`${field} resize-y`}
                />
                <button
                  type="button"
                  onClick={() =>
                    run(
                      'note',
                      () => addApplicationNote({ applicationId: app.id, body: note }),
                      () => setNote('')
                    )
                  }
                  disabled={isPending || !note.trim()}
                  className={quietButton}
                >
                  {busy === 'note' && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
                  Add note
                </button>
                <ErrorLine message={error?.on === 'note' ? error.message : null} />
              </div>

              <ol className="mt-5 space-y-4 border-l border-border-light dark:border-border-dark pl-4">
                {app.events.map((e) => (
                  <li key={e.id} className="relative">
                    <span
                      className={`absolute -left-5.25 top-1 w-2 h-2 rounded-full ${
                        e.kind === 'NOTE' ? 'bg-primary-light dark:bg-primary-dark' : 'bg-border-light dark:bg-border-dark'
                      }`}
                      aria-hidden="true"
                    />
                    <p className="text-xs font-nunito text-text-light dark:text-text-dark">{describe(e, nameOf)}</p>
                    {e.kind === 'NOTE' && e.body && (
                      <p className="mt-1 px-3 py-2 border-l-2 border-primary-light dark:border-primary-dark bg-bg-light dark:bg-bg-dark text-xs font-nunito text-text-light dark:text-text-dark whitespace-pre-wrap">
                        {e.body}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] font-mono text-muted-light dark:text-muted-dark">{formatDate(e.createdAt, true)}</p>
                  </li>
                ))}
              </ol>
            </Panel>
          </aside>
        </div>
      </div>
    </main>
  )
}
