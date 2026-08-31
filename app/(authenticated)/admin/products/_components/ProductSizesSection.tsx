import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { FormState, SectionHeader, SIZE_OPTIONS, inputCls } from './productForm.utils'

type Props = {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
}

export function ProductSizesSection({ form, set }: Props) {
  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <SectionHeader title="Sizes" aside={`${form.sizes.length} ${form.sizes.length === 1 ? 'size' : 'sizes'}`} />
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {form.sizes.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
            >
              <select
                value={entry.size}
                onChange={(e) => {
                  const updated = [...form.sizes]
                  updated[i] = { ...updated[i], size: e.target.value }
                  set('sizes', updated)
                }}
                aria-label={`Size ${i + 1}`}
                className={inputCls}
              >
                <option value="">Select size</option>
                {SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s} disabled={form.sizes.some((entry, idx) => idx !== i && entry.size === s)}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                value={entry.quantity === 0 ? '' : entry.quantity}
                onChange={(e) => {
                  const updated = [...form.sizes]
                  updated[i] = {
                    ...updated[i],
                    quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                  }
                  set('sizes', updated)
                }}
                placeholder="Qty"
                aria-label={`Quantity for size ${i + 1}`}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    'sizes',
                    form.sizes.filter((_, idx) => idx !== i)
                  )
                }
                className="text-muted-light dark:text-muted-dark hover:text-red-500 transition-colors p-1"
                aria-label={`Remove size ${entry.size || i + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {form.sizes.length > 0 && (
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-1 mt-0.5">
            <span className="text-[9px] font-mono text-muted-light dark:text-muted-dark px-0.5">SIZE</span>
            <span className="text-[9px] font-mono text-muted-light dark:text-muted-dark px-0.5">QUANTITY</span>
            <span className="w-5" />
          </div>
        )}

        <button
          type="button"
          onClick={() => set('sizes', [...form.sizes, { size: '', quantity: 0 }])}
          className="flex items-center gap-2 px-3 py-2 border border-dashed border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors w-full justify-center mt-1"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Add Size</span>
        </button>
      </div>
    </section>
  )
}
