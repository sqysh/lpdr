type Props = {
  baseAmount: number
  feesCovered: number
  finalAmount: number
  coverFees: boolean
  requiresShipping: boolean
  shippingCosts?: number | null
}

export function InstantBuyOrderSummary({
  baseAmount,
  feesCovered,
  finalAmount,
  coverFees,
  requiresShipping,
  shippingCosts,
}: Props) {
  return (
    <section
      aria-label="Order summary"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
        <h2 className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">
          Order Summary
        </h2>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-lato text-sm text-text-light dark:text-text-dark">Item price</span>
          <span className="font-lato text-sm text-text-light dark:text-text-dark">${baseAmount.toFixed(2)}</span>
        </div>
        {coverFees && (
          <div className="flex justify-between items-center">
            <span className="font-lato text-sm text-muted-light dark:text-muted-dark">Processing fee</span>
            <span className="font-lato text-sm text-muted-light dark:text-muted-dark">
              +${feesCovered.toFixed(2)}
            </span>
          </div>
        )}
        {requiresShipping && shippingCosts && (
          <div className="flex justify-between items-center">
            <span className="font-lato text-sm text-muted-light dark:text-muted-dark">Shipping</span>
            <span className="font-lato text-sm text-muted-light dark:text-muted-dark">
              +${Number(shippingCosts).toFixed(2)}
            </span>
          </div>
        )}
        <div className="border-t border-border-light dark:border-border-dark pt-2 flex justify-between items-center">
          <span className="text-sm uppercase tracking-widest text-text-light dark:text-text-dark">Total</span>
          <span className="text-lg text-primary-light dark:text-primary-dark">${finalAmount.toFixed(2)}</span>
        </div>
      </div>
    </section>
  )
}
