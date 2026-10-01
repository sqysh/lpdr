'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { useThemeStore } from 'stores/theme.store'
import { MAP_STYLE_LIGHT, MAP_STYLE_DARK, US_CENTER, US_ZOOM } from './_constants/map.constants'
import { clusterByGrid } from './_lib/clusterByGrid'
import { ClusterMarker } from './_components/ClusterMarker'
import { MapStatsPanel, RegionList } from './_components/MapStatsPanel'
import { SupporterList, TopSupporters } from './_components/TopSupporters'
import { PendingShipments, ShipmentList } from './_components/PendingShipments'
import { RevenueBreakdown, RevenueOverlay } from './_components/RevenueOverlay'
import { RegionCount } from './_types/map.types'
import { DollarSign, Heart, Loader2, MapPin, Truck } from 'lucide-react'
import { DockTab, MobileDock } from './_components/MobileDock'
import Link from 'next/link'

export function AdminDashboardClient({
  points,
  regionCounts,
  shipments,
  supporters,
  totalRevenue,
  orderMetrics
}: {
  points: {
    id: string
    lat: number
    lng: number
    city: string | null
    region: string | null
  }[]
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
}) {
  const isDark = useThemeStore((s) => s.isDark)
  const isResolved = useThemeStore((s) => s.isResolved)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [zoom, setZoom] = useState(US_ZOOM)
  const [sheet, setSheet] = useState<string | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  })

  const clusters = useMemo(() => clusterByGrid(points, zoom), [points, zoom])

  const [tilesReady, setTilesReady] = useState(false)

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

  const wholeDollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  const tabs: DockTab[] = [
    {
      id: 'revenue',
      label: 'Revenue',
      value: wholeDollars.format(totalRevenue),
      title: 'Total revenue · all time',
      icon: DollarSign,
      content: <RevenueBreakdown liveRevenue={totalRevenue} monthlyChange={orderMetrics.monthlyChange} sources={sources} />
    },
    ...(shipments.length > 0
      ? [
          {
            id: 'shipping',
            label: 'To ship',
            value: String(shipments.length),
            title: `Needs shipping · ${shipments.length} ${shipments.length === 1 ? 'order' : 'orders'}`,
            icon: Truck,
            tone: 'amber' as const,
            content: (
              <>
                <ShipmentList shipments={shipments} />
                <Link
                  href="/admin/transactions"
                  className="block px-4 py-3 border-t border-border-light dark:border-border-dark font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
                >
                  View all transactions →
                </Link>
              </>
            )
          }
        ]
      : []),
    ...(supporters.length > 0
      ? [
          {
            id: 'supporters',
            label: 'Givers',
            value: String(supporters.length),
            title: 'Top supporters',
            icon: Heart,
            content: <SupporterList supporters={supporters} />
          }
        ]
      : []),
    {
      id: 'located',
      label: 'Located',
      value: points.length.toLocaleString(),
      title: `${points.length.toLocaleString()} located · ${regionCounts.length} regions`,
      icon: MapPin,
      content: (
        <RegionList
          regionCounts={regionCounts}
          onRegionClick={(r) => {
            setSheet(null)
            focusRegion(r)
          }}
        />
      )
    }
  ]

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <p className="text-xs font-mono text-red-500 dark:text-red-400">Could not load the map. Check the API key configuration.</p>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100dvh-48px)] lg:h-dvh w-full">
      {isLoaded && isResolved && (
        <GoogleMap
          // backgroundColor is only read when the map is created, so switching theme recreates the map
          key={isDark ? 'dark' : 'light'}
          mapContainerClassName="absolute inset-0"
          center={US_CENTER}
          zoom={US_ZOOM}
          onLoad={onLoad}
          onTilesLoaded={() => setTilesReady(true)}
          onZoomChanged={onZoomChanged}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
            styles: isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT,
            // What shows through the hairline gaps between tiles; Google's default is a light gray that
            // blends into the light map but draws a grid over the dark one
            backgroundColor: isDark ? '#0d0d14' : '#f5f5f5'
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

      {!tilesReady && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-surface-light dark:bg-surface-dark"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-5 h-5 text-primary-light dark:text-primary-dark animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading map</span>
        </div>
      )}

      <MapStatsPanel total={points.length} regionCounts={regionCounts} onRegionClick={focusRegion} />

      <TopSupporters supporters={supporters} />

      <PendingShipments shipments={shipments} />

      <RevenueOverlay liveRevenue={totalRevenue} monthlyChange={orderMetrics.monthlyChange} sources={sources} />

      <MobileDock tabs={tabs} openId={sheet} onOpenChange={setSheet} />
    </div>
  )
}
