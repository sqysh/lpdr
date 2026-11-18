'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Palette, X } from 'lucide-react'

// Remembered in this browser only. Change the key to announce something new.
const DISMISSED_KEY = 'lpdr-admin-brand-identity-announcement'

const listeners = new Set<() => void>()
const subscribe = (notify: () => void) => {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}
const isDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}
const dismiss = () => {
  try {
    localStorage.setItem(DISMISSED_KEY, '1')
  } catch {}
  listeners.forEach((notify) => notify())
}

// Sits at the top centre on large screens, between the two corner panels, and across the top on phones. In between there is no
// room beside the panels, so it stays out of the way.
export function BrandIdentityAnnouncement() {
  // hidden on the server, so a dismissed announcement never flashes before the browser's choice is read
  const dismissed = useSyncExternalStore(subscribe, isDismissed, () => true)
  if (dismissed) return null

  return (
    <aside
      aria-label="New: brand identity"
      className="absolute z-10 top-3 inset-x-3 sm:hidden lg:block lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:top-4 lg:w-[min(24rem,calc(100%-40rem))] border border-border-light dark:border-border-dark bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur"
    >
      <div className="flex items-start gap-3 p-3.5">
        <Palette className="w-4 h-4 mt-0.5 shrink-0 text-primary-light dark:text-primary-dark" aria-hidden="true" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="font-mono text-[9px] tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">New · Brand identity</p>
          <p className="text-xs leading-relaxed text-text-light dark:text-text-dark">
            A proposed new logo and brand identity is ready for review.
          </p>
          <Link
            href="/admin/brand-identity"
            className="inline-block font-mono text-[10px] tracking-tag uppercase text-text-light dark:text-text-dark underline underline-offset-4 decoration-primary-light dark:decoration-primary-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            View the presentation
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 p-1 -m-1 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}
