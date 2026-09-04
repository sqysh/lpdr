export interface IAuctionItemPhoto {
  id: string
  url: string
  name?: string | null
  isPrimary: boolean
  sortOrder: number
  createdAt: Date
}
