import { getDachshundsByStatus } from 'lib/actions/_rescue-groups/getDachshundsByStatus'
import OnHoldDachshundsClient from './OnHoldDachshundsClient'

export default async function OnHoldDachshundsPage() {
  const data = await getDachshundsByStatus({
    status: 'Hold',
    pageLimit: 250,
    currentPage: 1,
    source: 'public-dachshunds-hold'
  })
  return <OnHoldDachshundsClient data={data} />
}
