'use client'

import { useState } from 'react'
import { Dog, ExternalLink } from 'lucide-react'
import Picture from 'components/_common/Picture'
import { formatDate } from 'lib/utils/date.utils'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import AdminFilterTabs from 'app/(authenticated)/admin/_components/AdminFilterTabs'
import AdminTable, { type Column } from 'app/(authenticated)/admin/_components/AdminTable'
import { IDachshund } from 'types/rescue-groups.types'

type Tab = 'AVAILABLE' | 'HOLD'

const TAB_LABELS: Record<Tab, string> = {
  AVAILABLE: 'Available',
  HOLD: 'Hold'
}

const TABS = ['AVAILABLE', 'HOLD'] as const

function formatQuality(quality: string): string {
  return quality
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim()
}

const columns: Column<IDachshund>[] = [
  {
    header: 'Dog',
    className: 'min-w-0',
    cell: (dog) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 shrink-0 overflow-hidden border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark">
          {dog?.attributes?.photos ? (
            <Picture src={dog.attributes.photos[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
              <Dog size={14} className="text-muted-light dark:text-muted-dark" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug">
            {dog?.attributes?.name ?? '—'}
          </p>
          {dog?.attributes?.qualities?.length > 0 && (
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5 truncate">
              {dog.attributes.qualities.slice(0, 3).map(formatQuality).join(' · ')}
            </p>
          )}
        </div>
      </div>
    )
  },
  {
    header: 'Age',
    className: 'text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap',
    cell: (dog) => dog?.attributes?.ageGroup ?? '—'
  },
  {
    header: 'Sex',
    className: 'text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap',
    cell: (dog) => dog?.attributes?.sex ?? '—'
  },
  {
    header: 'Breed',
    className: 'text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap',
    cell: (dog) => dog?.attributes?.breedString ?? '—'
  },
  {
    header: 'Added',
    className: 'text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap',
    cell: (dog) => formatDate(dog?.attributes?.createdDate)
  },
  {
    header: '',
    className: 'text-right whitespace-nowrap',
    cell: (dog) => (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://rescuegroups.org/manage/animal?animalID=${dog?.id}`}
        aria-label={`Open ${dog?.attributes?.name ?? 'dog'} in Rescue Groups`}
        className="inline-flex p-1.5 text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <ExternalLink size={14} aria-hidden="true" />
      </a>
    )
  }
]

export default function AdminDachshundsClient({
  available,
  hold
}: {
  available: IDachshund[]
  hold: IDachshund[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>('AVAILABLE')

  const tabData: Record<Tab, IDachshund[]> = { AVAILABLE: available, HOLD: hold }
  const filtered = tabData[activeTab] ?? []

  const counts: Record<Tab, number> = {
    AVAILABLE: available?.length ?? 0,
    HOLD: hold?.length ?? 0
  }
  const totalDogs = counts.AVAILABLE + counts.HOLD

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Dachshunds" count={{ value: totalDogs, noun: 'dog' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        <AdminFilterTabs
          options={TABS}
          value={activeTab}
          onChange={setActiveTab}
          counts={counts}
          labels={TAB_LABELS}
          label="Filter dachshunds by status"
        />

        <AdminTable
          columns={columns}
          rows={filtered}
          rowKey={(dog) => dog?.id}
          caption={`${TAB_LABELS[activeTab]} dachshunds synced from Rescue Groups`}
          emptyMessage={`No ${TAB_LABELS[activeTab].toLowerCase()} dogs`}
        />
      </div>
    </main>
  )
}
