import { useLinkStatus } from 'next/link'
import { Loader2 } from 'lucide-react'

/** Shows a spinner in the row while its route loads. */
export function NavRowBody({ Icon, label }: { Icon: React.ComponentType<{ className?: string }>; label: string }) {
  const { pending } = useLinkStatus()

  return (
    <>
      {pending ? (
        <Loader2 className="w-4.5 h-4.5 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
      )}
      <span className="font-mono text-[11px] tracking-widest uppercase">{label}</span>
    </>
  )
}
