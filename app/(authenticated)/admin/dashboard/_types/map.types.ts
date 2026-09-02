export type LatLngBoundsLiteral = {
  north: number
  south: number
  east: number
  west: number
}

export type RegionCount = {
  region: string
  count: number
  lat: number
  lng: number
  bounds: LatLngBoundsLiteral
}

export type SupporterPoint = {
  id: string
  lat: number
  lng: number
  city: string | null
  region: string | null
}
