import { RESCUE_GROUPS_BASE_URL } from 'lib/constants/paths.constants'

const TIMEOUT_MS = 8000
const RETRIES = 2

/** Retryable, because RescueGroups drops out for a second or two fairly regularly and a bare
 *  `fetch failed` on a dog's page is a supporter not seeing a dog. */
export async function rescueGroupsFetch(path: string, init: RequestInit = {}, retries = RETRIES): Promise<Response> {
  const url = path.startsWith('http') ? path : `${RESCUE_GROUPS_BASE_URL}${path}`

  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Authorization: process.env.RESCUE_GROUPS_API_KEY ?? '',
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json',
          ...init.headers
        },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      })

      // A 5xx is worth another go; a 404 is an answer and retrying only wastes time.
      if (response.status >= 500 && attempt < retries) {
        lastError = new Error(`RescueGroups returned ${response.status}`)
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
        continue
      }

      return response
    } catch (error) {
      lastError = error
      if (attempt < retries) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }

  throw lastError
}
