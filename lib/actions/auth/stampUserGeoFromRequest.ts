import { getRequestDetails } from 'app/utils/_log.server.utils'
import { stampUserGeo } from './stampUserGeo'

export async function stampUserGeoFromRequest(userId: string | undefined) {
  if (!userId) return null
  const details = await getRequestDetails()
  await stampUserGeo(userId, {
    geoLatitude: details.geoLatitude,
    geoLongitude: details.geoLongitude,
    geoCity: details.geoCity,
    geoRegion: details.geoRegion,
    geoCountry: details.geoCountry
  })
  return details
}
