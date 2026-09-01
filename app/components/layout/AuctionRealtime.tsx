import { getCachedAuction } from 'lib/actions/public/auction/getCachedAuction'
import { AuctionRealtimeClient } from './AuctionRealTimeClient'

export const AuctionRealtime = async () => {
  const auction = await getCachedAuction()
  if (!auction) return null

  return <AuctionRealtimeClient auctionId={auction.id} />
}
