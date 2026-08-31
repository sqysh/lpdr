'use client'

import { useMemo, useState } from 'react'
import { DollarSign, Clock, XCircle } from 'lucide-react'
import { formatDate } from 'app/utils/_date.utils'
import { AdoptionFeeStatus, IAdoptionFee } from 'types/_adoption-fee'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import { FILTERS, statusStyles } from 'lib/constants/adoption-fees.constants'
import { fmtCurrency } from 'app/utils/_currency.utils'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminTable, { type Column } from 'app/(authenticated)/admin/_components/AdminTable'

type Props = {
  fees: IAdoptionFee[]
}

type FeeFilter = AdoptionFeeStatus | 'ALL'

function StatusBadge({ status }: { status: AdoptionFeeStatus }) {
  return (
    <span
      className={`inline-block font-mono text-[10px] tracking-[0.15em] uppercase px-2 py-1 border ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

const fullName = (f: IAdoptionFee) => {
  const name = [f.firstName, f.lastName].filter(Boolean).join(' ')
  return name || 'Unknown'
}

const columns: Column<IAdoptionFee>[] = [
  {
    header: 'Applicant',
    cell: (f) => (
      <>
        <p className="text-sm font-bold text-text-light dark:text-text-dark">{fullName(f)}</p>
        {f.email && (
          <p className="font-mono text-[11px] text-muted-light dark:text-muted-dark mt-0.5">
            {f.email}
          </p>
        )}
      </>
    )
  },
  {
    header: 'Date',
    className: 'font-mono text-[13px] text-text-light dark:text-text-dark whitespace-nowrap',
    cell: (f) => formatDate(f.createdAt)
  },
  {
    header: 'State',
    className: 'font-mono text-[13px] text-muted-light dark:text-muted-dark',
    cell: (f) => (
      <>{f.order?.geoRegion ?? <span className="text-muted-light dark:text-muted-dark">—</span>}</>
    )
  },
  {
    header: 'Amount',
    className:
      'font-quicksand font-black text-sm text-text-light dark:text-text-dark whitespace-nowrap',
    cell: (f) => (f.feeAmount != null ? fmtCurrency(Number(f.feeAmount)) : '—')
  },
  {
    header: 'Bypass code',
    cell: (f) =>
      f.bypassCode ? (
        <span className="font-mono text-[12px] tracking-[0.08em] text-primary-light dark:text-primary-dark">
          {f.bypassCode}
        </span>
      ) : (
        <span className="text-muted-light dark:text-muted-dark">—</span>
      )
  },
  {
    header: 'Expires',
    className: 'font-mono text-[13px] text-muted-light dark:text-muted-dark whitespace-nowrap',
    cell: (f) => (f.expiresAt ? formatDate(f.expiresAt) : '—')
  },
  {
    header: 'Status',
    cell: (f) => <StatusBadge status={f.status} />
  }
]

const HISTORICAL_ADOPTION_FEE_TOTAL = 16185

export default function AdminAdoptionFeesClient({ fees }: Props) {
  const [filter, setFilter] = useState<FeeFilter>('ALL')

  const stats = useMemo(() => {
    const siteTotal = fees.reduce((sum, f) => sum + Number(f.feeAmount ?? 0), 0)
    return {
      siteTotal,
      total: siteTotal + HISTORICAL_ADOPTION_FEE_TOTAL,
      active: fees.filter((f) => f.status === 'ACTIVE').length,
      expired: fees.filter((f) => f.status === 'EXPIRED').length
    }
  }, [fees])

  const counts = useMemo(() => {
    const base = Object.fromEntries(FILTERS.map((f) => [f, 0])) as Record<FeeFilter, number>
    base.ALL = fees.length
    for (const f of fees) {
      if (f.status in base) base[f.status as FeeFilter]++
    }
    return base
  }, [fees])

  const visible = useMemo(
    () => (filter === 'ALL' ? fees : fees.filter((f) => f.status === filter)),
    [fees, filter]
  )

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Adoption Fees" count={{ value: fees.length, noun: 'fee' }} />

      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Total collected"
            value={fmtCurrency(stats.siteTotal)}
            icon={DollarSign}
            sublabel={`${fmtCurrency(stats.siteTotal)} on site + ${fmtCurrency(HISTORICAL_ADOPTION_FEE_TOTAL)} historical`}
          />
          <Stat label="Active" value={String(stats.active)} icon={Clock} />
          <Stat label="Expired" value={String(stats.expired)} icon={XCircle} />
        </div>

        {/* Filter */}
        <AdminFilterTabs
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          counts={counts}
          label="Filter adoption fees by status"
        />

        {/* Table */}
        <AdminTable
          columns={columns}
          rows={visible}
          rowKey={(f) => f.id}
          caption="Adoption fee applications"
          emptyMessage="No fees found"
        />
      </div>
    </main>
  )
}
