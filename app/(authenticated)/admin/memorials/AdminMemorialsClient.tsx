'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Clock, DollarSign, Heart, Settings, Sparkles } from 'lucide-react'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { formatMoney } from 'lib/utils/currency.utils'
import { MemorialCard } from './_components/MemorialCard'
import { AdminMemorial } from 'types/memorial.types'
import { MEMORIAL_FILTER_LABELS, MEMORIAL_FILTERS, MemorialFilter } from 'lib/constants/memorial.constants'
import { btnQuiet, isExpired, tabOf } from './_lib'
import { LinkBody } from 'components/_common/LinkBody'

export function AdminMemorialsClient({ memorials }: { memorials: AdminMemorial[] }) {
  const [filter, setFilter] = useState<MemorialFilter>('PENDING')

  const stats = useMemo(() => {
    const paid = memorials.filter((m) => m.order?.status === 'CONFIRMED')
    return {
      pending: memorials.filter((m) => m.status === 'PENDING').length,
      live: memorials.filter((m) => m.status === 'APPROVED' && !isExpired(m)).length,
      raised: paid.reduce((sum, m) => sum + (m.order?.totalAmount ?? 0), 0),
      gifts: paid.length
    }
  }, [memorials])

  const counts = useMemo(() => {
    const base: Record<MemorialFilter, number> = { PENDING: 0, APPROVED: 0, HIDDEN: 0 }
    for (const m of memorials) base[tabOf(m)]++
    return base
  }, [memorials])

  const visible = useMemo(() => {
    const rows = memorials.filter((m) => tabOf(m) === filter)
    // The queue is first come, first served; the other tabs read newest first
    return filter === 'PENDING' ? [...rows].reverse() : rows
  }, [memorials, filter])

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Rainbow Bridge" count={{ value: memorials.length, noun: 'memorial' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <Stat icon={Clock} label="Waiting for Review" value={String(stats.pending)} accent={stats.pending > 0} />
          <Stat icon={Sparkles} label="On the Wall" value={String(stats.live)} />
          <Stat icon={DollarSign} label="Raised" value={formatMoney(stats.raised)} />
          <Stat icon={Heart} label="Memorial Gifts" value={String(stats.gifts)} />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <AdminFilterTabs
            options={MEMORIAL_FILTERS}
            value={filter}
            onChange={setFilter}
            counts={counts}
            labels={MEMORIAL_FILTER_LABELS}
            label="Filter memorials by status"
          />
          <Link href="/admin/memorials/settings" className={btnQuiet}>
            <LinkBody icon={<Settings className="w-3.5 h-3.5" aria-hidden="true" />} label="Settings" spinnerClass="w-3.5 h-3.5" />
          </Link>
        </div>

        {visible.length === 0 ? (
          <div className="py-12 text-center text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            {filter === 'PENDING' ? 'Nothing waiting for review' : `No ${MEMORIAL_FILTER_LABELS[filter].toLowerCase()} memorials`}
          </div>
        ) : (
          <ul className="space-y-4">
            {visible.map((m) => (
              <MemorialCard key={m.id} memorial={m} />
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
