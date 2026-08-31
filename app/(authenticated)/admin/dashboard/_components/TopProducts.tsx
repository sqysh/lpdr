import { formatMoney } from 'app/utils/_currency.utils'

type Product = {
  name: string
  revenue: number
  unitsSold: number
  pctOfTop: number
}

export function TopProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-4">
        Top Selling Products
      </p>
      <ul className="space-y-3" role="list">
        {products.map((p) => (
          <li key={p.name}>
            <div className="flex items-center justify-between gap-3 mb-1">
              <p className="text-xs font-semibold text-text-light dark:text-text-dark truncate">
                {p.name}
              </p>
              <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark shrink-0 tabular-nums">
                {formatMoney(p.revenue)}
              </p>
            </div>
            <div className="h-1.5 bg-bg-light dark:bg-bg-dark w-full">
              <div
                className="h-full bg-primary-light dark:bg-primary-dark"
                style={{ width: `${p.pctOfTop}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
