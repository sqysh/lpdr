import { getCachedNavAuction } from 'lib/actions/public/auction/getCachedNavAuction'
import { AuctionRealtimeClient } from './AuctionRealTimeClient'

export const AuctionRealtime = async () => {
  const auction = await getCachedNavAuction()
  if (!auction) return null

  return <AuctionRealtimeClient auction={auction} />
}
