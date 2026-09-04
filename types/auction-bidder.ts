export interface IAuctionBidder {
  status: any
  id: string
  user?: {
    anonymousBidding: any
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
  } | null
}
