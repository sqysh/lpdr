import 'server-only'
import { headers } from 'next/headers'

export type RequestGeo = {
  geoLatitude: number | null
  geoLongitude: number | null
  geoCity: string | null
  geoRegion: string | null
  geoCountry: string | null
}

export type RequestDetails = {
  // Context
  ip: string | null
  userAgent: string | null
  device: string | null
  browser: string | null
  os: string | null
  referer: string | null
  origin: string | null
  language: string | null
  // Geo
  geoLatitude: number | null
  geoLongitude: number | null
  geoCity: string | null
  geoRegion: string | null
  geoCountry: string | null
}

const EMPTY: RequestDetails = {
  ip: null,
  userAgent: null,
  device: null,
  browser: null,
  os: null,
  referer: null,
  origin: null,
  language: null,
  geoLatitude: null,
  geoLongitude: null,
  geoCity: null,
  geoRegion: null,
  geoCountry: null
}

function parseUserAgent(ua: string | null): { device: string; browser: string; os: string } {
  if (!ua) return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' }

  const device = /mobile|android|iphone|ipad|tablet/i.test(ua)
    ? /tablet|ipad/i.test(ua)
      ? 'Tablet'
      : 'Mobile'
    : 'Desktop'

  const browser = /edg\//i.test(ua)
    ? 'Edge'
    : /opr\//i.test(ua)
      ? 'Opera'
      : /chrome/i.test(ua)
        ? 'Chrome'
        : /firefox/i.test(ua)
          ? 'Firefox'
          : /safari/i.test(ua)
            ? 'Safari'
            : /msie|trident/i.test(ua)
              ? 'Internet Explorer'
              : 'Unknown'

  const os = /windows nt/i.test(ua)
    ? 'Windows'
    : /mac os x/i.test(ua)
      ? 'macOS'
      : /android/i.test(ua)
        ? 'Android'
        : /iphone|ipad|ipod/i.test(ua)
          ? 'iOS'
          : /linux/i.test(ua)
            ? 'Linux'
            : 'Unknown'

  return { device, browser, os }
}

export async function getRequestDetails(): Promise<RequestDetails> {
  try {
    const h = await headers()

    const userAgent = h.get('user-agent')
    const { device, browser, os } = parseUserAgent(userAgent)

    const lat = parseFloat(h.get('x-vercel-ip-latitude') ?? '')
    const lng = parseFloat(h.get('x-vercel-ip-longitude') ?? '')
    const city = h.get('x-vercel-ip-city')

    return {
      ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
      userAgent,
      device,
      browser,
      os,
      referer: h.get('referer') ?? null,
      origin: h.get('origin') ?? null,
      language: h.get('accept-language')?.split(',')[0] ?? null,
      geoLatitude: Number.isFinite(lat) ? lat : null,
      geoLongitude: Number.isFinite(lng) ? lng : null,
      geoCity: city ? decodeURIComponent(city) : null,
      geoRegion: h.get('x-vercel-ip-country-region'),
      geoCountry: h.get('x-vercel-ip-country')
    }
  } catch {
    return EMPTY
  }
}
