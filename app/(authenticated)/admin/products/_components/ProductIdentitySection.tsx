import { FormState, inputCls, labelCls, SectionHeader } from './productForm.utils'

type Props = {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}

export function ProductIdentitySection({ form, set }: Props) {
  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <SectionHeader title="Identity" />
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className={labelCls}>
            Product Name <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Dachshund Plush Toy"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="description" className={labelCls}>
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe the product..."
            rows={5}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>
    </section>
  )
}
