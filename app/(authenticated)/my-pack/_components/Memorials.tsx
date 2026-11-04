'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { LinkBody } from 'components/_common/LinkBody'
import { MyMemorial } from 'lib/actions/user/memorial/getMyMemorials'

const isExpired = (m: MyMemorial) => !!m.expiresAt && new Date(m.expiresAt) < new Date()

// Written for the family, so a hidden memorial is described plainly without the admin's reason
function statusText(m: MyMemorial) {
  if (m.status === 'PENDING') return 'Waiting for a quick review before it joins the Rainbow Bridge.'
  if (m.status === 'HIDDEN') return 'Not shown on the Rainbow Bridge. Email lpdr@littlepawsdr.org with any questions.'
  if (m.status === 'EXPIRED' || isExpired(m)) return `Was on the Rainbow Bridge until ${formatDate(m.expiresAt!)}.`
  return m.expiresAt ? `On the Rainbow Bridge until ${formatDate(m.expiresAt)}.` : 'On the Rainbow Bridge.'
}

export function Memorials({ memorials }: { memorials: MyMemorial[] }) {
  if (!memorials?.length) {
    return (
      <p className="text-sm text-muted-light dark:text-muted-dark">
        You haven&apos;t placed a memorial yet. A memorial gift puts your dog&apos;s name on a butterfly over our Rainbow Bridge.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {memorials.map((m) => {
        const onWall = m.status === 'APPROVED' && !isExpired(m)

        return (
          <li key={m.id} className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            {m.status !== 'HIDDEN' && (
              <Image
                src={`/api/memorial-art/${m.id}?v=${new Date(m.updatedAt).getTime()}`}
                alt={`A butterfly over the Rainbow Bridge carrying the name ${m.dogName}`}
                width={960}
                height={640}
                unoptimized
                className="w-full h-auto"
              />
            )}

            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-3">
                {m.photoUrl && (
                  <Image
                    src={m.photoUrl}
                    alt={m.dogName}
                    width={80}
                    height={80}
                    sizes="40px"
                    className="w-10 h-10 shrink-0 object-cover border border-border-light dark:border-border-dark"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-quicksand font-bold text-text-light dark:text-text-dark wrap-break-word">{m.dogName}</p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                    {formatMoney(m.amount)} · {formatDate(m.createdAt)}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-light dark:text-muted-dark leading-relaxed">{statusText(m)}</p>

              {onWall && (
                <Link
                  href="/rainbow-bridge"
                  className="inline-flex items-center gap-1 text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  <LinkBody icon={<ArrowRight className="w-3 h-3" aria-hidden="true" />} label="See the Rainbow Bridge" iconAfter />
                </Link>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
