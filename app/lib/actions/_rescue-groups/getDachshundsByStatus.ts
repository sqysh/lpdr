import { createLog } from '../log/createLog'
import { getPicturesAndVideos } from '../../../utils/_rescue-group.utils'
import { getErrorMessage } from 'app/utils/_error.utils'

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
    const response = await fetch(
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
