import { IAuction } from 'types/auction.types'

export type YearGroup = {
  year: number
  quarters: QuarterGroup[]
}

export type QuarterGroup = {
  quarter: number
  auctions: IAuction[]
}
