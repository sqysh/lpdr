'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ChevronRight, CircleDollarSign, FilePen, FileSignature, Loader2, PenLine, Plus, Send } from 'lucide-react'
import type { IAdoptionAgreementRow } from 'types/adoption-agreement.types'
import {
  AGREEMENT_FILTERS,
  AGREEMENT_FILTER_LABELS,
  AGREEMENT_STATUS_HINT,
  OFFLINE_PAYMENT_INSTRUCTIONS,
  type AgreementFilter
} from 'lib/constants/adoption-agreement.constants'
import { agreementTotal } from 'lib/utils/adoption-agreement.utils'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import Picture from 'components/_common/Picture'
import { LinkBody } from 'components/_common/LinkBody'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { actionFor } from './_lib/actionFor'

const COL_COUNT = 7

const STATUS_STYLE: Record<IAdoptionAgreementRow['status'], string> = {
  DRAFT: 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark',
  SENT: 'border-sky-500/40 text-sky-600 dark:text-sky-400',
  SIGNED: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
  PAID: 'border-violet-500/40 text-violet-600 dark:text-violet-400',
  COMPLETE: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  VOID: 'border-red-500/30 text-red-500/80 dark:text-red-400/80',
  RETURNED: 'border-zinc-400/40 text-zinc-500'
}

const paymentLabel = (method: IAdoptionAgreementRow['paymentMethod']) =>
  method === 'CARD' ? 'Card' : OFFLINE_PAYMENT_INSTRUCTIONS[method].label

// The date that matters depends on where it is: when it was paid, when it went out, or when it was started
const relevantDate = (a: IAdoptionAgreementRow) => a.paidAt ?? a.sentAt ?? a.createdAt

export function AdoptionAgreementsClient({ agreements }: { agreements: IAdoptionAgreementRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<AgreementFilter>('ALL')
  const [isPending, startTransition] = useTransition()
  // isPending alone would spin every row, so the clicked id decides which one shows it
  const [openingId, setOpeningId] = useState<string | null>(null)

  const open = (id: string) => {
    setOpeningId(id)
    startTransition(() => router.push(`/admin/adoption-agreements/${id}`))
  }

  const counts = useMemo(() => {
    const base = Object.fromEntries(AGREEMENT_FILTERS.map((f) => [f, 0])) as Record<AgreementFilter, number>
    for (const a of agreements) {
      base.ALL++
      base[a.status]++
    }
    return base
  }, [agreements])

  const emailFailures = useMemo(() => agreements.filter((a) => a.status === 'SENT' && a.emailFailedAt).length, [agreements])

  const rows = useMemo(() => {
    const filtered = filter === 'ALL' ? agreements : agreements.filter((a) => a.status === filter)
    // Anything waiting on LPDR floats to the top; the rest keep their most-recent-first order
    return [...filtered].sort((x, y) => Number(!!actionFor(y)) - Number(!!actionFor(x)))
  }, [agreements, filter])

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Adoption Agreements" count={{ value: agreements.length, noun: 'agreement' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Each card is a queue: what's waiting on whom */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={FilePen} label="Drafts" value={String(counts.DRAFT)} />
          <Stat icon={Send} label="Waiting to Sign" value={String(counts.SENT)} />
          <Stat icon={CircleDollarSign} label="Waiting for Payment" value={String(counts.SIGNED)} accent={counts.SIGNED > 0} />
          <Stat icon={PenLine} label="Needs Countersign" value={String(counts.PAID)} accent={counts.PAID > 0} />
        </div>

        {emailFailures > 0 && (
          <p
            role="alert"
            className="flex items-center gap-2 px-4 py-3 border border-red-500/30 bg-red-500/5 text-xs font-mono text-red-600 dark:text-red-400"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {emailFailures} agreement{emailFailures === 1 ? "'s" : "s'"} email failed to send. Open {emailFailures === 1 ? 'it' : 'them'} to
            send again.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <AdminFilterTabs
            options={AGREEMENT_FILTERS}
            value={filter}
            onChange={setFilter}
            counts={counts}
            labels={AGREEMENT_FILTER_LABELS}
            label="Filter agreements by status"
          />
          <Link
            href="/admin/adoption-agreements/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light dark:bg-primary-dark text-white text-f10 font-mono tracking-eyebrow uppercase hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <LinkBody icon={<Plus className="w-3 h-3" aria-hidden="true" />} label="New agreement" />
          </Link>
        </div>

        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Adoption agreements, most recently updated first</caption>
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {['Dog', 'Adopter', 'Status', 'Payment', 'Total', 'Date', ''].map((h, i) => (
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
                    <FileSignature className="w-5 h-5 mx-auto mb-2 text-muted-light/50 dark:text-muted-dark/50" aria-hidden="true" />
                    <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                      {filter === 'ALL' ? 'No agreements yet' : `No ${AGREEMENT_FILTER_LABELS[filter].toLowerCase()} agreements`}
                    </p>
                  </td>
                </tr>
              )}

              {rows.map((a) => {
                const adopter = [a.firstName, a.lastName].filter(Boolean).join(' ')
                const action = actionFor(a)
                const ActionIcon = action?.icon

                return (
                  <tr
                    key={a.id}
                    onClick={() => open(a.id)}
                    className={`group cursor-pointer transition-colors ${action ? `${action.tint} hover:brightness-95 dark:hover:brightness-125` : 'hover:bg-bg-light dark:hover:bg-bg-dark'}`}
                  >
                    <td className={`px-4 py-3 border-l-[3px] ${action ? action.bar : 'border-l-transparent'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-9 h-9 shrink-0 overflow-hidden bg-bg-light dark:bg-bg-dark">
                          {a.dogPhoto && <Picture src={a.dogPhoto} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/adoption-agreements/${a.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block text-xs font-nunito font-bold text-text-light dark:text-text-dark truncate hover:text-primary-light dark:hover:text-primary-dark focus:outline-none focus-visible:underline"
                          >
                            {a.dogName}
                          </Link>
                          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">#{a.dogRescueId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 min-w-0 max-w-56">
                      <p className="text-xs font-nunito text-text-light dark:text-text-dark truncate">{adopter || '—'}</p>
                      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">{a.email}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 border text-[9px] font-mono tracking-eyebrow uppercase ${STATUS_STYLE[a.status]}`}
                      >
                        {AGREEMENT_FILTER_LABELS[a.status]}
                      </span>
                      {action && ActionIcon ? (
                        <p className={`flex items-center gap-1.5 mt-1 text-[10px] font-mono font-bold ${action.text}`}>
                          <span className="relative flex w-1.5 h-1.5" aria-hidden="true">
                            <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
                            <span className="relative w-1.5 h-1.5 rounded-full bg-current" />
                          </span>
                          <ActionIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
                          {action.label}
                        </p>
                      ) : (
                        <p className="mt-1 text-[10px] font-mono text-muted-light dark:text-muted-dark">
                          {AGREEMENT_STATUS_HINT[a.status]}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {paymentLabel(a.paymentMethod)}
                    </td>

                    <td className="px-4 py-3 text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark whitespace-nowrap">
                      {formatMoney(agreementTotal(a))}
                    </td>

                    <td className="px-4 py-3 text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {formatDate(relevantDate(a), true)}
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
