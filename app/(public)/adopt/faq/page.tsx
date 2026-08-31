import { getDachshundsByStatus } from 'lib/actions/_rescue-groups/getDachshundsByStatus'
import { IDachshund } from 'types/_rescue-groups.types'
import AdoptFAQClient from './AdoptFAQClient'

export default async function AdoptFAQPage() {
  const result = await getDachshundsByStatus({
    status: 'Available',
    pageLimit: 250,
    currentPage: 1,
    source: 'adopt-faq'
  })
  const dachshunds: IDachshund[] = result.success ? result.data.data : []
  return <AdoptFAQClient dachshunds={dachshunds} />
}
