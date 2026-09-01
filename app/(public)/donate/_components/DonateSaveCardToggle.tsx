import { Toggle } from 'components/_primitives'

interface DonateSaveCardToggleProps {
  checked: boolean
  onToggle: () => void
  usingNewCard: boolean
}

export function DonateSaveCardToggle({ checked, onToggle, usingNewCard }: DonateSaveCardToggleProps) {
  if (!usingNewCard) return null
  return (
    <Toggle
      id="donate-save-card"
      label="Save card for future donations"
      description="Securely stored by Stripe. Remove any time from your account."
      checked={checked}
      onToggle={onToggle}
    />
  )
}
