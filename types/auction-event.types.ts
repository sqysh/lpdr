export interface AuctionStartedData {
  auctionId: string
  auctionTitle: string
  itemCount: number
  endDate: string
  customAuctionLink?: string
}

export interface AuctionEndedData {
  auctionTitle: string
  totalRaised: number
  itemCount: number
  bidderCount: number
  customAuctionLink: string
}
