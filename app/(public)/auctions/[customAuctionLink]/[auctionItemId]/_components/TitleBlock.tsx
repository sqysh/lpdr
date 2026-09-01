import { formatMoney } from 'app/utils/_currency.utils'
import { motion } from 'framer-motion'
import { Gavel, ShieldCheck, Tag, Truck } from 'lucide-react'

export function TitleBlock({ headerInView, isFixed, isSold, isActive, item }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={headerInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.08 }}
    >
      {/* Format + status badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 border border-border-light dark:border-border-dark">
          {isFixed ? (
            <>
              <Tag size={10} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
              <span className="text-[9px] font-mono text-muted-light dark:text-muted-dark">Fixed Price</span>
            </>
          ) : (
            <>
              <Gavel size={10} className="text-primary-light dark:text-primary-dark" aria-hidden="true" />
              <span className="text-[9px] font-mono text-primary-light dark:text-primary-dark">Auction</span>
            </>
          )}
        </div>
        {isSold && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 border border-emerald-500/40 bg-emerald-500/10">
            <ShieldCheck size={10} className="text-emerald-500" aria-hidden="true" />
            <span className="text-[9px] font-mono text-emerald-500 font-black">Sold</span>
          </div>
        )}
        {isActive && !isSold && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 border border-emerald-500/40 bg-emerald-500/10">
            <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-[9px] font-mono text-emerald-500 font-black">Live</span>
          </div>
        )}
        {item?.requiresShipping && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 border border-border-light dark:border-border-dark">
            <Truck size={10} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
            <span className="text-[9px] font-mono text-muted-light dark:text-muted-dark">
              {item?.shippingCosts ? `Ships +${formatMoney(item?.shippingCosts)}` : 'Shipping Included'}
            </span>
          </div>
        )}
      </div>

      <h1 className="font-quicksand font-black text-2xl xs:text-3xl sm:text-4xl text-text-light dark:text-text-dark leading-tight mb-3">
        {item?.name}
      </h1>

      {item?.description && (
        <p className="text-sm font-nunito text-muted-light dark:text-muted-dark leading-relaxed">{item?.description}</p>
      )}
    </motion.div>
  )
}
