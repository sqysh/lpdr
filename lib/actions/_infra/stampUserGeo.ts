import { RequestGeo } from 'lib/utils/log.server.utils'
import prisma from 'prisma/client'

export async function stampUserGeo(userId: string | null | undefined, geo: RequestGeo) {
  if (!userId || geo.geoLatitude == null) return

  const STORES_COORDINATES = geo.geoCountry === 'US'

  await prisma.user
    .update({
      where: { id: userId },
      data: {
        lastGeoLatitude: STORES_COORDINATES ? geo.geoLatitude : null,
        lastGeoLongitude: STORES_COORDINATES ? geo.geoLongitude : null,
        lastGeoCity: geo.geoCity,
        lastGeoRegion: geo.geoRegion,
        lastGeoCountry: geo.geoCountry
      }
    })
    .catch(() => {}) // best-effort — never block a checkout on geo
}
