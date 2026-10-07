'use client'

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link, { useLinkStatus } from 'next/link'

const STEP_CLASS =
  'flex items-center gap-2 px-4 py-3 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark shrink-0'

/** useLinkStatus only reports on a navigation, so it has to live inside the Link. */
function StepBody({ name, direction }: { name: string; direction: 'prev' | 'next' }) {
  const { pending } = useLinkStatus()

  const icon = pending ? (
    <Loader2 size={14} className="animate-spin shrink-0" aria-hidden="true" />
  ) : direction === 'prev' ? (
    <ChevronLeft size={14} className="shrink-0" aria-hidden="true" />
  ) : (
    <ChevronRight size={14} className="shrink-0" aria-hidden="true" />
  )

  // The label block is hidden below sm, so on a phone the spinner replacing the chevron is the only feedback
  const label = (
    <div className={`hidden sm:block ${direction === 'prev' ? 'text-left' : 'text-right'}`}>
      <p className="text-[10px] font-mono uppercase tracking-eyebrow text-muted-light dark:text-muted-dark">
        {direction === 'prev' ? 'Prev' : 'Next'}
      </p>
      <p className="text-[11px] font-mono font-black truncate max-w-25">{pending ? 'Loading' : name}</p>
    </div>
  )

  return direction === 'prev' ? (
    <>
      {icon}
      {label}
    </>
  ) : (
    <>
      {label}
      {icon}
    </>
  )
}

/** One end of a fixed footer bar: a link to the neighbouring item, or an invisible spacer so the middle stays centred. */
export function FooterStep({
  href,
  name,
  direction,
  label
}: {
  href: string | null
  name: string
  direction: 'prev' | 'next'
  label: string
}) {
  if (!href) {
    return (
      <div className="px-4 py-3 shrink-0 opacity-0 pointer-events-none" aria-hidden="true">
        {direction === 'prev' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </div>
    )
  }

  return (
    <Link href={href} prefetch className={STEP_CLASS} aria-label={label}>
      <StepBody name={name} direction={direction} />
    </Link>
  )
}
