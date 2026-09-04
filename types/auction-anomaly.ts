export interface IAuctionAnomaly {
  id: string
  auctionId: string
  type: string
  itemId: string
  itemName: string
  message: string
  metadata: any
  dismissed: boolean
  createdAt: Date
  updatedAt: Date
}
