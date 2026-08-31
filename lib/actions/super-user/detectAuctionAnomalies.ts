import createAuctionAnomaly from 'lib/actions/super-user/createAuctionAnomaly'
import { Anomaly, LiveBidEvent } from 'lib/mock/live-auction.mock'
import { IAuctionItem } from 'types/_auction-item'

export async function detectAuctionAnomalies({
  event,
  updatedItems,
  auctionId,
  userBidTimestamps
}: {
  event: LiveBidEvent
  updatedItems: IAuctionItem[]
  auctionId: string
  userBidTimestamps: React.RefObject<Record<string, Date[]>>
}): Promise<Anomaly[]> {
  const item = updatedItems.find((i) => i.id === event.auctionItemId)
  if (!item) return []

  const newAnomalies: Anomaly[] = []

  // ── Duplicate bid amount ───────────────────────────────────────────────────
  const bidsAtSameAmount = item.bids.filter((b) => Number(b.bidAmount) === event.confirmedBidAmount)
  if (bidsAtSameAmount.length > 1) {
    const anomaly: Anomaly = {
      id: `dup-${event.auctionItemId}-${event.confirmedBidAmount}-${Date.now()}`,
      type: 'DUPLICATE_BID_AMOUNT',
      itemId: item.id,
      itemName: item.name,
      message: `${bidsAtSameAmount.length} bids at $${event.confirmedBidAmount} on "${item.name}"`,
      bids: bidsAtSameAmount as any,
      createdAt: new Date(),
      dismissed: false
    }
    newAnomalies.push(anomaly)
    await createAuctionAnomaly({
      auctionId,
      type: anomaly.type,
      itemId: anomaly.itemId,
      itemName: anomaly.itemName,
      message: anomaly.message,
      metadata: { bidAmount: event.confirmedBidAmount, bidCount: bidsAtSameAmount.length }
    })
  }

  // ── Bid below current price ────────────────────────────────────────────────
  if (item.currentBid && event.confirmedBidAmount < item.currentBid) {
    const anomaly: Anomaly = {
      id: `below-${event.auctionItemId}-${Date.now()}`,
      type: 'BID_BELOW_CURRENT',
      itemId: item.id,
      itemName: item.name,
      message: `Bid of $${event.confirmedBidAmount} went through below current price of $${item.currentBid} on "${item.name}"`,
      bids: item.bids.filter((b) => Number(b.bidAmount) === event.confirmedBidAmount) as any,
      createdAt: new Date(),
      dismissed: false
    }
    newAnomalies.push(anomaly)
    await createAuctionAnomaly({
      auctionId,
      type: anomaly.type,
      itemId: anomaly.itemId,
      itemName: anomaly.itemName,
      message: anomaly.message,
      metadata: { bidAmount: event.confirmedBidAmount, currentBid: item.currentBid }
    })
  }

  // ── Rapid bidding ──────────────────────────────────────────────────────────
  if (event.userId) {
    const now = new Date()
    const timestamps = userBidTimestamps.current[event.userId] ?? []
    const recent = timestamps.filter((t) => now.getTime() - t.getTime() < 10000)
    recent.push(now)
    userBidTimestamps.current[event.userId] = recent

    if (recent.length > 3) {
      const anomaly: Anomaly = {
        id: `rapid-${event.userId}-${Date.now()}`,
        type: 'RAPID_BIDDING',
        itemId: item.id,
        itemName: 'Multiple Items',
        message: `User ${event.userEmail ?? event.userId} placed ${recent.length} bids in under 10 seconds`,
        bids: [],
        createdAt: new Date(),
        dismissed: false
      }
      newAnomalies.push(anomaly)
      await createAuctionAnomaly({
        auctionId,
        type: anomaly.type,
        itemId: anomaly.itemId,
        itemName: anomaly.itemName,
        message: anomaly.message,
        metadata: { userId: event.userId, userEmail: event.userEmail, bidCount: recent.length }
      })
    }
  }

  return newAnomalies
}
