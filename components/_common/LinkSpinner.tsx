'use client'

import { Loader2 } from 'lucide-react'
import { useLinkStatus } from 'next/link'

/** Swaps the label for a spinner while the route loads, without changing the link's width. */
export function LinkSpinner({ label, spinnerClass = 'w-3 h-3' }: { label: string; spinnerClass?: string }) {
  const { pending } = useLinkStatus()

  return (
    <span className="relative inline-flex items-center justify-center">
      {/* Kept in the layout while hidden, so the button doesn't shrink to the spinner's size */}
      <span className={pending ? 'invisible' : undefined}>{label}</span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className={`${spinnerClass} animate-spin`} aria-hidden="true" />
          <span className="sr-only">Loading</span>
        </span>
      )}
    </span>
  )
}
