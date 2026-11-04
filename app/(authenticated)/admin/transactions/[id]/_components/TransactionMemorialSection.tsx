'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { IOrder } from 'types/order.types'
import { LinkBody } from 'components/_common/LinkBody'

const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Waiting for review', className: 'text-amber-600 dark:text-amber-400 border-amber-600/40 dark:border-amber-400/40' },
  APPROVED: { label: 'On the wall', className: 'text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40' },
  HIDDEN: { label: 'Hidden', className: 'text-muted-light dark:text-muted-dark border-border-light dark:border-border-dark' },
  EXPIRED: { label: 'Expired', className: 'text-muted-light dark:text-muted-dark border-border-light dark:border-border-dark' }
}

export function TransactionMemorialSection({ memorial }: { memorial: NonNullable<IOrder['memorial']> }) {
  const status = STATUS[memorial.status] ?? STATUS.PENDING

  return (
    <section
      aria-labelledby="order-memorial-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between gap-3">
        <h2 id="order-memorial-heading" className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
          Rainbow Bridge memorial
        </h2>
        <span className={`px-2 py-0.5 border text-[9px] font-mono tracking-eyebrow uppercase ${status.className}`}>{status.label}</span>
      </div>

      <div className="flex flex-col sm:flex-row">
        {/* Hidden memorials have no art: the route returns 404 so nothing hidden can be shared */}
        {memorial.status !== 'HIDDEN' && (
          <div className="sm:w-60 shrink-0 border-b sm:border-b-0 sm:border-r border-border-light dark:border-border-dark">
            <Image
              src={`/api/memorial-art/${memorial.id}?v=${new Date(memorial.updatedAt).getTime()}`}
              alt={`Memorial card for ${memorial.dogName}`}
              width={960}
              height={640}
              unoptimized
              className="w-full h-auto"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 px-4 py-3 space-y-3">
          <div className="flex items-center gap-3">
            {memorial.photoUrl && (
              <Image
                src={memorial.photoUrl}
                alt={`Photo of ${memorial.dogName}`}
                width={96}
                height={96}
                sizes="48px"
                className="w-12 h-12 shrink-0 object-cover border border-border-light dark:border-border-dark"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-nunito font-bold text-text-light dark:text-text-dark wrap-break-word">
                In memory of {memorial.dogName}
              </p>
              <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
                {memorial.showDonorName && memorial.donorDisplayName ? `Loved by ${memorial.donorDisplayName}` : 'Donor name not shown'}
              </p>
            </div>
          </div>

          {memorial.message && (
            <p className="text-sm text-text-light dark:text-text-dark leading-relaxed whitespace-pre-wrap wrap-break-word border-l-2 border-border-light dark:border-border-dark pl-3">
              {memorial.message}
            </p>
          )}

          <Link
            href="/admin/memorials"
            className="inline-flex items-center gap-1 text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <LinkBody icon={<ArrowRight className="w-3 h-3" aria-hidden="true" />} label="Review in Rainbow Bridge" iconAfter />
          </Link>
        </div>
      </div>
    </section>
  )
}
