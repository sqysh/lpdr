import Link from 'next/link'
import { EmptyState } from './EmptyState'
import { StatusPill } from 'app/components/_primitives/StatusPill'
import { formatMoney } from 'app/utils/_currency.utils'
import { formatDate } from 'app/utils/_date.utils'

export function Subscriptions({ subscriptions }) {
  return (
    <section aria-labelledby="subscriptions-heading">
      {subscriptions?.length === 0 ? (
        <EmptyState message="No active subscriptions." />
      ) : (
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
          role="list"
        >
          {subscriptions.map((sub) => {
            const isCancelled = sub.status === 'CANCELLED'
            return (
              <li
                key={sub.id}
                className={`bg-bg-light dark:bg-bg-dark p-5 ${isCancelled ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-quicksand font-black text-base text-text-light dark:text-text-dark leading-snug truncate">
                      {sub.tierName}
                    </p>
                    {isCancelled && (
                      <p className="text-[9px] font-mono tracking-[0.15em] uppercase text-red-500 dark:text-red-400 mt-0.5">
                        Cancelled
                      </p>
                    )}
                  </div>
                  <StatusPill status={sub.status} />
                </div>

                <p
                  className={`font-quicksand font-black text-2xl ${isCancelled ? 'text-muted-light dark:text-muted-dark' : 'text-primary-light dark:text-primary-dark'}`}
                >
                  {formatMoney(sub.amount)}
                  <span className="text-xs font-mono font-normal text-muted-light dark:text-muted-dark ml-1">
                    / {sub.interval}
                  </span>
                </p>

                {sub.nextBillingDate && sub.status === 'CONFIRMED' && (
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-2">
                    Next billing {formatDate(sub.nextBillingDate)}
                  </p>
                )}

                {sub.nextBillingDate && isCancelled && (
                  <p className="text-[10px] font-mono text-red-500/70 dark:text-red-400/70 mt-2">
                    Active until {formatDate(sub.nextBillingDate)}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                  <Link
                    href={`/my-pack/subscription/${sub.id}?ref=?tab=giving`}
                    aria-label={`View details for ${sub.tierName} subscription`}
                    title={`View details for ${sub.tierName} subscription`}
                    className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline"
                  >
                    View details →
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
