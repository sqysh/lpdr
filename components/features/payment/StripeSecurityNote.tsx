import { Lock } from 'lucide-react'

export function StripeSecurityNote({ extra }: { extra?: string }) {
  return (
    <p className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-light dark:text-muted-dark">
      <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
      Secured by Stripe. We never store your card details.
      {extra ? ` ${extra}` : ''}
    </p>
  )
}
