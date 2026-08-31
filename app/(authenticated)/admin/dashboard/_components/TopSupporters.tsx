import { formatMoney } from 'app/utils/_currency.utils'
import Picture from 'app/components/_common/Picture'
import Link from 'next/link'

type Supporter = {
  userId: string | null
  name: string
  location: string | null
  image: string | null
  totalGiven: number
  orderCount: number
}

export function TopSupporters({ supporters }: { supporters: Supporter[] }) {
  if (supporters.length === 0) return null

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-4">
        Top Supporters
      </p>
      <ul className="space-y-3" role="list">
        {supporters.map((s, i) => (
          <li key={s.userId ?? i}>
            <Link
              href={s.userId ? `/admin/users/${s.userId}` : '#'}
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
            >
              <div className="w-8 h-8 shrink-0 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 flex items-center justify-center overflow-hidden">
                {s.image ? (
                  <Picture
                    priority={false}
                    src={s.image}
                    alt=""
                    className="w-full h-full object-cover"
                    unoptimized={false}
                  />
                ) : (
                  <span className="font-quicksand font-black text-[10px] text-primary-light dark:text-primary-dark">
                    {s.name[0]?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text-light dark:text-text-dark truncate group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                  {s.name}
                </p>
                {s.location && (
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">
                    {s.location}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-quicksand font-black text-xs text-text-light dark:text-text-dark tabular-nums">
                  {formatMoney(s.totalGiven)}
                </p>
                <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark">
                  {s.orderCount} order{s.orderCount === 1 ? '' : 's'}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
