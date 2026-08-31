import { FormState, SectionHeader } from './productForm.utils'

type Props = {
  form: FormState
  countInStock: number
}

export function ProductSummarySection({ form, countInStock }: Props) {
  const rows = [
    { label: 'Price', value: form.price ? `$${parseFloat(form.price).toFixed(2)}` : '—' },
    { label: 'Shipping', value: form.shippingPrice ? `$${parseFloat(form.shippingPrice).toFixed(2)}` : '—' },
    { label: 'Stock', value: countInStock || '—' },
    { label: 'Images', value: form.images.length },
    { label: 'Type', value: form.isPhysicalProduct ? 'Physical' : 'Digital' },
    { label: 'Status', value: form.isLive ? 'Live' : 'Draft' }
  ]

  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <SectionHeader title="Summary" />
      <div className="flex flex-col gap-2.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">{label}</span>
            <span
              className={`text-[10px] font-mono ${
                label === 'Status'
                  ? form.isLive
                    ? 'text-emerald-500'
                    : 'text-muted-light dark:text-muted-dark'
                  : 'text-text-light dark:text-text-dark'
              }`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
