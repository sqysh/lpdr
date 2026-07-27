import { unstable_cache } from 'next/cache'
import { createLog } from '../log/createLog'
import { getPicturesAndVideos } from '../../../utils/_rescue-group.utils'
import { getErrorMessage } from 'app/utils/_error.utils'

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(8000)
      })
      return response
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
      }
    }
  }

  throw lastError
}

async function fetchDachshundsFromApi(status: string, pageLimit: number) {
  const response = await fetchWithRetry(
    `https://api.rescuegroups.org/v5/public/orgs/5798/animals/search/dogs?limit=${pageLimit}`,
    {
      method: 'POST',
      headers: {
        Authorization: process.env.RESCUE_GROUPS_API_KEY ?? '',
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          filters: [
            {
              fieldName: 'statuses.name',
              operation: 'equals',
              criteria: status
            }
          ]
        }
      })
    }
  )

  if (!response.ok) throw new Error(`Failed to fetch dachshunds: ${response.statusText}`)

  const data = await response.json()

  if (data?.data) {
    data.data = (await getPicturesAndVideos(data))?.reverse() ?? []
  }

  return data
}

const cachedFetchDachshunds = unstable_cache(fetchDachshundsFromApi, ['dachshunds-by-status'], {
  revalidate: 300
})

export async function getDachshundsByStatus({
  status,
  pageLimit,
  currentPage,
  source
}: {
  status: string
  pageLimit: number
  currentPage: number
  source: string
}) {
  try {
    const data = await cachedFetchDachshunds(status, pageLimit)
    return { success: true, data }
  } catch (error) {
    await createLog('error', 'Failed to fetch dachshunds by status', {
      status,
      pageLimit,
      currentPage,
      source,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to fetch dachshunds' }
  }
}
