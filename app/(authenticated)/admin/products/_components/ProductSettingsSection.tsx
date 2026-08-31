import { FormState, SectionHeader } from './productForm.utils'

type Props = {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}

function SettingToggle({
  label,
  description,
  checked,
  onToggle
}: {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-mono text-text-light dark:text-text-dark">{label}</p>
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        className={`relative w-10 h-5.5 transition-colors focus:outline-none ${
          checked ? 'bg-primary-light dark:bg-primary-dark' : 'bg-border-light dark:bg-border-dark'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white transition-transform ${
            checked ? 'translate-x-4.5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

export function ProductSettingsSection({ form, set }: Props) {
  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <SectionHeader title="Settings" />
      <div className="flex flex-col gap-4">
        <SettingToggle
          label="Physical Product"
          description="Requires shipping"
          checked={form.isPhysicalProduct}
          onToggle={() => {
            const next = !form.isPhysicalProduct
            set('isPhysicalProduct', next)
            if (!next) set('shippingPrice', '')
          }}
        />
        <div className="h-px bg-border-light dark:bg-border-dark" />
        <SettingToggle
          label="Published"
          description="Visible to customers"
          checked={form.isLive}
          onToggle={() => set('isLive', !form.isLive)}
        />
      </div>
    </section>
  )
}
