'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getWelcomeWieners } from 'lib/actions/admin/welcome-wiener/getWelcomeWieners'
import Picture from 'components/_common/Picture'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import AdminHeaderButton from 'app/(authenticated)/admin/_components/AdminHeaderButton'
import AdminTable, { type Column } from 'app/(authenticated)/admin/_components/AdminTable'

type WelcomeWienerRow = NonNullable<Awaited<ReturnType<typeof getWelcomeWieners>>['data']>[number]

type Props = {
  welcomeWieners: WelcomeWienerRow[]
}

const columns: Column<WelcomeWienerRow>[] = [
  {
    header: 'Dog',
    className: 'min-w-0',
    cell: (w) => (
      <div className="flex items-center gap-3">
        {w.images[0] ? (
          <Picture
            priority={false}
            src={w.images[0]}
            alt=""
            className="w-8 h-8 object-cover border border-border-light dark:border-border-dark shrink-0"
          />
        ) : (
          <div
            className="w-8 h-8 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark shrink-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">?</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-nunito text-text-light dark:text-text-dark truncate">
            {w.name ?? (
              <span className="text-muted-light dark:text-muted-dark italic">Unnamed</span>
            )}
          </p>
          {w.bio && (
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate max-w-45">
              {w.bio}
            </p>
          )}
        </div>
      </div>
    )
  },
  {
    header: 'Age',
    className: 'text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap',
    cell: (w) => w.age ?? '—'
  },
  {
    header: 'Products',
    className: 'text-xs font-mono tabular-nums text-muted-light dark:text-muted-dark',
    cell: (w) => (w.associatedProducts as unknown[])?.length ?? 0
  },
  {
    header: 'Status',
    className: 'whitespace-nowrap',
    cell: (w) => {
      const status = w.archivedAt ? 'Archived' : w.isLive ? 'Live' : 'Draft'
      const textColor = w.archivedAt
        ? 'text-muted-light dark:text-muted-dark'
        : w.isLive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-600 dark:text-amber-400'
      const dotColor = w.archivedAt
        ? 'bg-border-light dark:bg-border-dark'
        : w.isLive
          ? 'bg-emerald-500'
          : 'bg-amber-500'
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.15em] uppercase ${textColor}`}
        >
          <span className={`w-1.5 h-1.5 shrink-0 ${dotColor}`} aria-hidden="true" />
          {status}
        </span>
      )
    }
  },
  {
    header: '',
    className: 'text-right whitespace-nowrap',
    cell: (w) => (
      <Link
        href={`/admin/welcome-wieners/${w.id}`}
        className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline"
        aria-label={`Edit ${w.name ?? 'wiener'}`}
      >
        Edit →
      </Link>
    )
  }
]

export default function AdminWelcomeWienersClient({ welcomeWieners }: Props) {
  const wieners = welcomeWieners

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader
        title="Welcome Wieners"
        count={{ value: wieners.length, noun: 'wiener' }}
        action={
          <AdminHeaderButton
            href="/admin/welcome-wieners/new"
            icon={<Plus size={11} aria-hidden="true" />}
          >
            Add Wiener
          </AdminHeaderButton>
        }
      />

      <div className="w-full px-4 sm:px-6 py-6">
        <AdminTable
          columns={columns}
          rows={wieners}
          rowKey={(w) => w.id}
          caption="Welcome Wiener profiles and their donation products"
          emptyMessage={
            <span className="flex flex-col items-center gap-3">
              No welcome wieners yet
              <Link
                href="/admin/welcome-wieners/new"
                className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:underline"
              >
                Add the first one →
              </Link>
            </span>
          }
        />
      </div>
    </main>
  )
}
