import { Toggle } from 'components/_primitives'

type Props = {
  checked: boolean
  onChange: (value: boolean) => void
  processingFee: number
}

export function CoverFeesToggle({ checked, onChange, processingFee }: Props) {
  return (
    <Toggle
      id="cover-fees"
      label="Cover processing fees"
      description={`Add $${processingFee.toFixed(2)} so 100% goes to the rescue`}
      checked={checked}
      onToggle={() => onChange(!checked)}
    />
  )
}
