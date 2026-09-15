import { CreateAuctionItemInput } from 'lib/schemas/auction.schema'
import { formatMoney } from 'lib/utils/currency.utils'

export function buildSummary(payload: CreateAuctionItemInput, photoCount: number) {
  const price =
    payload.sellingFormat === 'AUCTION'
      ? payload.startingPrice != null
        ? `starting at ${formatMoney(payload.startingPrice)}`
        : null
      : payload.buyNowPrice != null
        ? `${formatMoney(payload.buyNowPrice)} each`
        : null

  const shipping = payload.requiresShipping
    ? payload.shippingCosts != null
      ? `+${formatMoney(payload.shippingCosts)} shipping`
      : 'shipping TBD'
    : 'no shipping'

  return (
    [
      payload.sellingFormat === 'AUCTION' ? 'Auction item' : 'Instant buy',
      price,
      shipping,
      photoCount > 0 ? `${photoCount} photo${photoCount === 1 ? '' : 's'} added` : null
    ]
      .filter(Boolean)
      .join(' · ') || undefined
  )
}
