export const serializeDecimal = (value: any) => (value != null ? Number(value) : null)

export const serializeAuction = (a: any) => ({
  ...a,
  goal: Number(a.goal),
  totalAuctionRevenue: Number(a.totalAuctionRevenue)
})

export const serializeAuctionItem = (item: any) => ({
  ...item,
  startingPrice: serializeDecimal(item.startingPrice),
  buyNowPrice: serializeDecimal(item.buyNowPrice),
  currentPrice: serializeDecimal(item.currentPrice),
  currentBid: serializeDecimal(item.currentBid),
  minimumBid: serializeDecimal(item.minimumBid),
  soldPrice: serializeDecimal(item.soldPrice),
  shippingCosts: serializeDecimal(item.shippingCosts)
})

export const serializeAuctionBid = (bid: any) => ({
  ...bid,
  bidAmount: Number(bid.bidAmount)
})

export const serializeWinningBidder = (b: any) => ({
  ...b,
  totalPrice: serializeDecimal(b.totalPrice),
  shipping: serializeDecimal(b.shipping),
  processingFee: serializeDecimal(b.processingFee),
  itemSoldPrice: serializeDecimal(b.itemSoldPrice)
})

export const serializeInstantBuyer = (b: any) => ({
  ...b,
  totalPrice: serializeDecimal(b.totalPrice)
})
