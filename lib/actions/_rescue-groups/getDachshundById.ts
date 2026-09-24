import { createLog } from '../log/createLog'
import { getPicturesAndVideos } from '../../utils/rescue-group.utils'
import { rescueGroupsFetch } from 'lib/rescue-groups/rescue-groups.client'
import { Dog } from 'types/rescue-groups.types'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export async function getDachshundById(id: string): Promise<ActionResult<{ data: Dog[] }>> {
  try {
    const response = await rescueGroupsFetch(`/animals/${id}`, { next: { revalidate: 3600 } })

    // A dog that has been adopted or removed is a normal 404, not something to log as an error.
    if (response.status === 404) {
      return { success: false, data: null, error: 'Dachshund not found' }
    }

    if (!response.ok) throw new Error(`RescueGroups returned ${response.status} ${response.statusText}`)

    const json = await response.json()

    if (!json?.data) return { success: false, data: null, error: 'Dachshund not found' }

    await getPicturesAndVideos(json)

    return { success: true, data: json }
  } catch (error) {
    await createLog('error', 'Failed to fetch dachshund by id', { id, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to fetch dachshund' }
  }
}
