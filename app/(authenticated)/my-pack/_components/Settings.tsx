import { Toggle } from 'app/components/_primitives'

type Props = {
  anonymousBidding: boolean
  onToggleAnonymousBidding: () => void
  autoPay: boolean
  onToggleAutoPay: () => void
  autoPayCoverFees: boolean
  onToggleAutoPayCoverFees: () => void
  autoPayError?: string | null
}

export function Settings({
  anonymousBidding,
  onToggleAnonymousBidding,
  autoPay,
  onToggleAutoPay,
  autoPayCoverFees,
  onToggleAutoPayCoverFees,
  autoPayError
}: Props) {
  return (
    <div className="divide-y divide-border-light dark:divide-border-dark">
      <Toggle
        id="anonymous-bidding"
        label="Anonymous bidding"
        description="Your name won't be shown to other bidders when you place a bid."
        checked={anonymousBidding}
        onToggle={onToggleAnonymousBidding}
      />
      <Toggle
        id="auto-pay"
        label="Auto-pay when I win"
        description="Automatically charge your saved card when the auction ends and you're a top bidder — no action needed."
        checked={autoPay}
        onToggle={onToggleAutoPay}
      />
      {autoPayError && (
        <p className="px-3.5 py-2.5 text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/5 border-b border-border-light dark:border-border-dark">
          {autoPayError}
        </p>
      )}
      {autoPay && (
        <Toggle
          id="auto-pay-cover-fees"
          label="Cover processing fees when auto-paying"
          description="Add the Stripe processing fee to your charge so 100% of your bid goes to the rescue."
          checked={autoPayCoverFees}
          onToggle={onToggleAutoPayCoverFees}
        />
      )}
    </div>
  )
}
