'use client'

import { useLinkStatus } from 'next/link'
import { Loader2 } from 'lucide-react'
import Picture from 'components/_common/Picture'

/**
 * Avatar plus label for a My Pack link. Renders a spinner in place of the
 * avatar while the route loads, since /my-pack pulls a fair amount of data.
 * Must be rendered inside a Link for useLinkStatus to report anything.
 */
export function MyPackAvatar({ userImage, initials }: { userImage?: string | null; initials: string }) {
  const { pending } = useLinkStatus()

  return (
    <>
      <div
        aria-hidden="true"
        className="shrink-0 w-7 h-7 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 group-hover:border-primary-light dark:group-hover:border-primary-dark flex items-center justify-center overflow-hidden transition-colors"
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark animate-spin" />
        ) : userImage ? (
          <Picture priority src={userImage} alt="" className="w-full h-full object-cover" unoptimized={false} />
        ) : (
          <span className="text-[9px] font-mono font-bold text-primary-light dark:text-primary-dark uppercase">{initials}</span>
        )}
      </div>

      <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-on-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
        {pending ? 'Loading...' : 'My Pack'}
      </span>
    </>
  )
}
