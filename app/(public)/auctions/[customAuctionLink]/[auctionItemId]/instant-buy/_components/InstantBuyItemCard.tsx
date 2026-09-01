import Image from 'next/image'
import { Truck } from 'lucide-react'

type Props = {
  name: string
  description?: string | null
  coverPhoto?: string | null
  requiresShipping: boolean
  shippingCosts?: number | null
  baseAmount: number
}

export function InstantBuyItemCard({
  name,
  description,
  coverPhoto,
  requiresShipping,
  shippingCosts,
  baseAmount,
}: Props) {
  return (
    <section
      aria-label="Item details"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="flex gap-4 p-4">
        {coverPhoto && (
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 overflow-hidden border border-border-light dark:border-border-dark">
            <Image
              src={coverPhoto}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 96px, 128px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <h2 className="text-sm sm:text-base uppercase tracking-widest text-text-light dark:text-text-dark leading-snug">
            {name}
          </h2>
          {description && (
            <p className="font-lato text-xs text-muted-light dark:text-muted-dark leading-relaxed line-clamp-2">
              {description}
            </p>
          )}
          {requiresShipping && (
            <div className="flex items-center gap-1.5">
              <Truck className="w-3 h-3 text-muted-light dark:text-muted-dark shrink-0" aria-hidden="true" />
              <span className="font-lato text-xs text-muted-light dark:text-muted-dark">
                {shippingCosts
                  ? `Shipping: $${Number(shippingCosts).toFixed(2)}`
                  : 'Shipping included'}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-border-light dark:border-border-dark px-4 py-3 flex items-center justify-between">
        <span className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">
          Buy Now Price
        </span>
        <span className="text-lg text-primary-light dark:text-primary-dark">
          ${baseAmount.toFixed(2)}
        </span>
      </div>
    </section>
  )
}
