import { unstable_cache } from 'next/cache'
import { createLog } from '../log/createLog'
import { getPicturesAndVideos } from '../../utils/rescue-group.utils'
import { rescueGroupsFetch } from 'lib/rescue-groups/rescue-groups.client'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

async function fetchDachshundsFromApi(status: string, pageLimit: number) {
  const response = await rescueGroupsFetch(`/animals/search/dogs?limit=${pageLimit}`, {
    method: 'POST',
    body: JSON.stringify({
      data: { filters: [{ fieldName: 'statuses.name', operation: 'equals', criteria: status }] }
    })
  })

  if (!response.ok) throw new Error(`RescueGroups returned ${response.status} ${response.statusText}`)

  const data = await response.json()

  if (data?.data) {
    data.data = (await getPicturesAndVideos(data))?.reverse() ?? []
  }

  return data
}

const cachedFetchDachshunds = unstable_cache(fetchDachshundsFromApi, ['dachshunds-by-status'], { revalidate: 300 })

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
}): Promise<ActionResult<Awaited<ReturnType<typeof fetchDachshundsFromApi>>>> {
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

    return { success: false, data: null, error: 'Failed to fetch dachshunds' }
  }
}
