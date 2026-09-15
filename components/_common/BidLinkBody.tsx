import { ChevronRight, Loader2 } from 'lucide-react'
import { useLinkStatus } from 'next/link'

export function BidLinkBody({ label }: { label: string }) {
  const { pending } = useLinkStatus()

  return (
    <>
      <span className="text-f9 font-mono tracking-eyebrow uppercase font-black relative z-10">{label}</span>
      {pending ? (
        <Loader2 size={12} className="animate-spin relative z-10" aria-hidden="true" />
      ) : (
        <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform relative z-10" aria-hidden="true" />
      )}
    </>
  )
}
