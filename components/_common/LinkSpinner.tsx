import { Loader2 } from 'lucide-react'
import { useLinkStatus } from 'next/link'

/** Replaces the label with a spinner while the route is loading. */
export function LinkSpinner({ label, spinnerClass = 'w-3 h-3' }: { label: string; spinnerClass?: string }) {
  const { pending } = useLinkStatus()

  if (pending) {
    return (
      <>
        <Loader2 className={`${spinnerClass} animate-spin`} aria-hidden="true" />
        {label}
        <span className="sr-only">Loading</span>
      </>
    )
  }

  return <>{label}</>
}
