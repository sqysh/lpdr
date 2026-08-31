import { User, MapPin } from 'lucide-react'
import { SerializedOrder } from 'types/_order.types'
import { Label } from './OrderLabel'

export function OrderCustomerSection({ order }: { order: SerializedOrder }) {
  return (
    <section
      aria-labelledby="customer-heading"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
        <h2
          id="customer-heading"
          className="flex items-center gap-2 font-quicksand font-black text-sm text-text-light dark:text-text-dark"
        >
          <User className="w-4 h-4 text-primary-light dark:text-primary-dark" aria-hidden="true" />
          Customer
        </h2>
      </div>
      <div className="px-4 py-4 space-y-3">
        <div>
          <Label>Name</Label>
          <p className="text-xs font-mono text-text-light dark:text-text-dark mt-1">{order.customerName || '—'}</p>
        </div>
        <div>
          <Label>Email</Label>
          <p className="text-xs font-mono text-text-light dark:text-text-dark mt-1 break-all">
            {order.customerEmail || '—'}
          </p>
        </div>
        {(order.geoCity || order.geoRegion) && (
          <div>
            <Label>Location at purchase</Label>
            <p className="flex items-center gap-1.5 text-xs font-mono text-text-light dark:text-text-dark mt-1">
              <MapPin className="w-3 h-3 text-muted-light dark:text-muted-dark" aria-hidden="true" />
              {[order.geoCity, order.geoRegion, order.geoCountry].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
