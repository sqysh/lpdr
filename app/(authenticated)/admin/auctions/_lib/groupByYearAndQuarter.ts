import { YearGroup } from '../_types/auctions.types'
import { IAuction } from 'types/_auction'

export function getYear(date: string | Date) {
  return new Date(date).getFullYear()
}

export function getQuarter(date: string | Date) {
  const d = new Date(date)
  return Math.floor(d.getMonth() / 3) + 1
}

export function groupByYearAndQuarter(auctions: IAuction[]): YearGroup[] {
  const map = new Map<number, Map<number, IAuction[]>>()

  for (const auction of auctions) {
    const year = getYear(auction.startDate)
    const quarter = getQuarter(auction.startDate)

    if (!map.has(year)) map.set(year, new Map())
    const yearMap = map.get(year)!
    if (!yearMap.has(quarter)) yearMap.set(quarter, [])
    yearMap.get(quarter)!.push(auction)
  }

  return [...map.entries()]
    .sort(([a], [b]) => b - a) // newest year first
    .map(([year, quarterMap]) => ({
      year,
      quarters: [...quarterMap.entries()]
        .sort(([a], [b]) => b - a) // newest quarter first
        .map(([quarter, auctions]) => ({ quarter, auctions }))
    }))
}
