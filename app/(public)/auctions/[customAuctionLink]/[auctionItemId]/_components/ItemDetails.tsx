import { SectionLabel } from 'app/components/_primitives'
import { formatMoney } from 'app/utils/_currency.utils'
import { motion } from 'framer-motion'

export function ItemDetails({ headerInView, isFixed, item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={headerInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="border border-border-light dark:border-border-dark"
    >
      <div className="px-5 py-3.5 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <SectionLabel>Item Details</SectionLabel>
      </div>
      <div className="divide-y divide-border-light dark:divide-border-dark">
        {[
          { label: 'Format', value: isFixed ? 'Fixed Price' : 'Auction' },
          { label: 'Quantity', value: String(item?.totalQuantity) },
          {
            label: 'Shipping',
            value: item?.requiresShipping
              ? item?.shippingCosts
                ? `+${formatMoney(item?.shippingCosts)}`
                : 'Included'
              : 'No Shipping'
          },
          ...(item?.startingPrice != null && !isFixed
            ? [{ label: 'Starting Bid', value: formatMoney(item?.startingPrice) }]
            : []),
          ...(item?.buyNowPrice != null ? [{ label: 'Buy Now Price', value: formatMoney(item?.buyNowPrice) }] : [])
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-5 py-3">
            <span className="text-[10px] font-mono tracking-[0.12em] uppercase text-muted-light dark:text-muted-dark">
              {label}
            </span>
            <span className="text-xs font-mono font-black text-text-light dark:text-text-dark">{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
