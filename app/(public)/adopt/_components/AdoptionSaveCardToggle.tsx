import { Toggle } from 'app/components/_primitives'

type Props = {
  checked: boolean
  onChange: (value: boolean) => void
  isAuthed: boolean
  selectedCardId: string | null
  useNewCard: boolean
}

export function AdoptionSaveCardToggle({ checked, onChange, isAuthed, selectedCardId, useNewCard }: Props) {
  // Hidden when using a saved card
  if (!isAuthed || (selectedCardId && !useNewCard)) return null

  return (
    <Toggle
      id="save-card"
      label="Save card for future donations"
      description="One-click checkout next time"
      checked={checked}
      onToggle={() => onChange(!checked)}
    />
  )
}
