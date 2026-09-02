'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'

export const getSupporterLocations = async () => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const users = await prisma.user.findMany({
      where: { lastGeoLatitude: { not: null }, lastGeoLongitude: { not: null } },
      select: {
        id: true,
        lastGeoLatitude: true,
        lastGeoLongitude: true,
        lastGeoCity: true,
        lastGeoRegion: true
      }
    })

    const byRegion = users.reduce<
      Record<string, { count: number; latSum: number; lngSum: number; bounds: number[] }>
    >((acc, u) => {
      const region = u.lastGeoRegion ?? 'Unknown'
      const lat = u.lastGeoLatitude!
      const lng = u.lastGeoLongitude!
      const existing = acc[region]

      if (!existing) {
        acc[region] = { count: 1, latSum: lat, lngSum: lng, bounds: [lat, lng, lat, lng] }
        return acc
      }

      existing.count += 1
      existing.latSum += lat
      existing.lngSum += lng
      existing.bounds = [
        Math.min(existing.bounds[0], lat),
        Math.min(existing.bounds[1], lng),
        Math.max(existing.bounds[2], lat),
        Math.max(existing.bounds[3], lng)
      ]
      return acc
    }, {})

    const regionCounts = Object.entries(byRegion)
      .map(([region, r]) => ({
        region,
        count: r.count,
        lat: r.latSum / r.count,
        lng: r.lngSum / r.count,
        bounds: { south: r.bounds[0], west: r.bounds[1], north: r.bounds[2], east: r.bounds[3] }
      }))
      .sort((a, b) => b.count - a.count)

    return {
      success: true,
      data: {
        points: users.map((u) => ({
          id: u.id,
          lat: u.lastGeoLatitude!,
          lng: u.lastGeoLongitude!,
          city: u.lastGeoCity,
          region: u.lastGeoRegion
        })),
        regionCounts
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to fetch supporter locations', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { success: false, error: 'Failed to load supporter locations', data: null }
  }
}
