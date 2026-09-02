type Pt = { lat: number; lng: number }

export type Cluster<T extends Pt> = {
  key: string
  lat: number
  lng: number
  items: T[]
}

export function clusterByGrid<T extends Pt>(points: T[], zoom: number): Cluster<T>[] {
  // Cell size in degrees, shrinking as you zoom in
  const cell = 40 / Math.pow(2, zoom)
  const buckets = new Map<string, T[]>()

  for (const p of points) {
    const key = `${Math.floor(p.lat / cell)}:${Math.floor(p.lng / cell)}`
    const existing = buckets.get(key)
    if (existing) existing.push(p)
    else buckets.set(key, [p])
  }

  return [...buckets.entries()].map(([_, items]) => ({
    key: items
      .map((i) => (i as { id?: string }).id ?? `${i.lat},${i.lng}`)
      .sort()
      .join('|'),
    lat: items.reduce((s, i) => s + i.lat, 0) / items.length,
    lng: items.reduce((s, i) => s + i.lng, 0) / items.length,
    items
  }))
}
