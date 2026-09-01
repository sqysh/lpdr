import { motion } from 'framer-motion'
import Link from 'next/link'
import { EmptyState } from './EmptyState'
import { formatDate } from 'app/utils/_date.utils'
import { formatMoney } from 'app/utils/_currency.utils'
import { StatusPill } from 'app/components/_primitives/StatusPill'

export function OneTimeDonations({ donations }) {
  return (
    <section aria-labelledby="donations-heading">
      {donations?.length === 0 ? (
        <EmptyState message="No donations yet." />
      ) : (
        <div className="border border-border-light dark:border-border-dark overflow-hidden">
          <table className="w-full" role="table" aria-label="One-time donations">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                <th
                  scope="col"
                  className="px-4 sm:px-5 py-3 text-left text-[9px] font-mono tracking-[0.18em] uppercase text-muted-light dark:text-muted-dark"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-5 py-3 text-left text-[9px] font-mono tracking-[0.18em] uppercase text-muted-light dark:text-muted-dark"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-5 py-3 text-left text-[9px] font-mono tracking-[0.18em] uppercase text-muted-light dark:text-muted-dark"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 sm:px-5 py-3 text-left text-[9px] font-mono tracking-[0.18em] uppercase text-muted-light dark:text-muted-dark"
                ></th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d, i) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-150"
                >
                  <td className="px-4 sm:px-5 py-3.5 text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                    {formatDate(d.createdAt, true)}
                  </td>
                  <td className="px-4 sm:px-5 py-3.5 font-quicksand font-black text-sm text-text-light dark:text-text-dark whitespace-nowrap">
                    {formatMoney(d.amount)}
                  </td>
                  <td className="px-4 sm:px-5 py-3.5">
                    <StatusPill status={d.status} />
                  </td>
                  <td className="px-4 sm:px-5 py-3.5 text-right">
                    <Link
                      href={`/order-confirmation/${d.id}?ref=?tab=giving`}
                      aria-label={`View order confirmation for ${formatDate(d.createdAt)}`}
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      <span className="hidden sm:inline">View</span>
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
