import { FormState, inputCls, labelCls, SectionHeader } from './productForm.utils'

type Props = {
  form: FormState
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void
  sizesTotal: number
  hasSizes: boolean
}

export function ProductPricingSection({ form, set, sizesTotal, hasSizes }: Props) {
  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5">
      <SectionHeader title="Pricing & Inventory" />
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
        <div>
          <label htmlFor="price" className={labelCls}>
            Price ($)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="0.00"
            className={inputCls}
          />
        </div>
        {form.isPhysicalProduct && (
          <div>
            <label htmlFor="shipping" className={labelCls}>
              Shipping ($)
            </label>
            <input
              id="shipping"
              type="number"
              min="0"
              step="0.01"
              value={form.shippingPrice}
              onChange={(e) => set('shippingPrice', e.target.value)}
              placeholder="0.00"
              className={inputCls}
            />
          </div>
        )}
        <div>
          <label htmlFor="stock" className={labelCls}>
            Count in Stock
          </label>
          {hasSizes ? (
            <>
              <input
                id="stock"
                type="number"
                value={sizesTotal}
                readOnly
                disabled
                aria-describedby="stock-hint"
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              />
              <p id="stock-hint" className="mt-1 text-[9px] font-mono text-muted-light dark:text-muted-dark">
                Calculated from sizes
              </p>
            </>
          ) : (
            <input
              id="stock"
              type="number"
              min="0"
              value={form.countInStock}
              onChange={(e) => set('countInStock', e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          )}
        </div>
      </div>
    </section>
  )
}
