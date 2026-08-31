import PublicDachshundsClient from 'app/(public)/dachshunds/PublicDachshundsClient'
import { getDachshundsByStatus } from 'lib/actions/_rescue-groups/getDachshundsByStatus'

export default async function DachshundsPage() {
  const data = await getDachshundsByStatus({
    status: 'Available',
    pageLimit: 250,
    currentPage: 1,
    source: 'public-dachshunds'
  })
  return <PublicDachshundsClient data={data} />
}
