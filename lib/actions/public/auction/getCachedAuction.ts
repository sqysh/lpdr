import { unstable_cache } from 'next/cache'
import getDraftOrActiveAuction from './getDraftOrActiveAuction'

export const getCachedAuction = unstable_cache(
  async () => {
    const result = await getDraftOrActiveAuction()
    return result.success ? result.data : null
  },
  ['nav-auction'],
  { tags: ['auction'] }
)
