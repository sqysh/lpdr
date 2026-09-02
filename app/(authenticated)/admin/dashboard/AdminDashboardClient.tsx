'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { useThemeStore } from 'stores/theme.store'
import { MAP_STYLE_LIGHT, MAP_STYLE_DARK, US_CENTER, US_ZOOM } from './_constants/map.constants'
import { clusterByGrid } from './_lib/clusterByGrid'
import { ClusterMarker } from './_components/ClusterMarker'
import { MapStatsPanel } from './_components/MapStatsPanel'
import { TopSupporters } from './_components/TopSupporters'
import { PendingShipments } from './_components/PendingShipments'
import { RevenueOverlay } from './_components/RevenueOverlay'
import { RegionCount } from './_types/map.types'

type Point = {
  id: string
  lat: number
  lng: number
  city: string | null
  region: string | null
}

type Props = {
  points: Point[]
  regionCounts: { region: string; count: number }[]
  shipments: {
    id: string
    name: string
    items: string
    total: number
    createdAt: string
    address: string
  }[]
  supporters: {
    userId: string
    name: string
    location: string
    image: string
    totalGiven: number
    orderCount: number
  }[]
  totalRevenue: number
  orderMetrics: {
    monthlyChange: number
    ordersByType: {
      type: string
      count: number
      total: number
    }[]
  }
}

export function AdminDashboardClient({
  points,
  regionCounts,
  shipments,
  supporters,
  totalRevenue,
  orderMetrics
}: Props) {
  const isDark = useThemeStore((s) => s.isDark)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [zoom, setZoom] = useState(US_ZOOM)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  })

  const clusters = useMemo(() => clusterByGrid(points, zoom), [points, zoom])

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onZoomChanged = useCallback(() => {
    const next = mapRef.current?.getZoom()
    if (next == null) return
    setZoom((prev) => (prev === next ? prev : next))
  }, [])

  const handleClusterClick = (lat: number, lng: number) => {
    mapRef.current?.panTo({ lat, lng })
    mapRef.current?.setZoom(Math.min(14, zoom + 3))
  }

  const sources = [...(orderMetrics.ordersByType ?? [])].sort((a, b) => b.total - a.total)

  const focusRegion = useCallback((r: RegionCount) => {
    const map = mapRef.current
    if (!map) return

    const { south, west, north, east } = r.bounds

    if (south === north && west === east) {
      map.panTo({ lat: r.lat, lng: r.lng })
      map.setZoom(10)
      return
    }

    map.fitBounds({ south, west, north, east }, 64)
  }, [])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <p className="text-xs font-mono text-red-500 dark:text-red-400">
          Could not load the map. Check the API key configuration.
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100dvh-48px)] lg:h-dvh w-full">
      {isLoaded && (
        <GoogleMap
          mapContainerClassName="absolute inset-0"
          center={US_CENTER}
          zoom={US_ZOOM}
          onLoad={onLoad}
          onZoomChanged={onZoomChanged}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            styles: isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT
          }}
        >
          {clusters.map((cluster) => (
            <ClusterMarker
              key={cluster.key}
              lat={cluster.lat}
              lng={cluster.lng}
              count={cluster.items.length}
              label={
                cluster.items.length === 1
                  ? [cluster.items[0].city, cluster.items[0].region].filter(Boolean).join(', ')
                  : `${cluster.items.length} supporters`
              }
              onClick={() => handleClusterClick(cluster.lat, cluster.lng)}
            />
          ))}
        </GoogleMap>
      )}

      {/* Stats overlay */}
      <MapStatsPanel
        total={points.length}
        regionCounts={regionCounts}
        onRegionClick={focusRegion}
      />

      <TopSupporters supporters={supporters} />

      <PendingShipments shipments={shipments} />

      <RevenueOverlay
        liveRevenue={totalRevenue}
        monthlyChange={orderMetrics.monthlyChange}
        sources={sources}
      />
    </div>
  )
}
