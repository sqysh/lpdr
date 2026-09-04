import { createLog } from '../log/createLog'
import { getPicturesAndVideos } from '../../utils/rescue-group.utils'
import { Dog } from 'types/_rescue-groups.types'
import { RESCUE_GROUPS_BASE_URL } from 'lib/constants/paths.constants'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/_action.types'

export async function getDachshundById(id: string): Promise<ActionResult<{ data: Dog }>> {
  try {
    const response = await fetch(`${RESCUE_GROUPS_BASE_URL}/animals/${id}`, {
      headers: {
        Authorization: process.env.RESCUE_GROUPS_API_KEY ?? '',
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch animal: ${response.statusText}`)
    }

    const json = await response.json()

    if (!json?.data) {
      return { success: false, data: null, error: 'Dachshund not found' }
    }

    await getPicturesAndVideos(json)

    return { success: true, data: json }
  } catch (error) {
    await createLog('error', 'Failed to fetch dachshund by id', {
      id,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to fetch dachshund' }
  }
}
