import { IAuction } from 'types/_auction'

export type YearGroup = {
  year: number
  quarters: QuarterGroup[]
}

export type QuarterGroup = {
  quarter: number
  auctions: IAuction[]
}
