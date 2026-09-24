import { getAdoptionPayments } from 'lib/actions/admin/order/getAdoptionPayments'
import { AdoptionPaymentsClient } from './AdoptionPaymentsClient'

export default async function AdoptionPaymentsPage() {
  const result = await getAdoptionPayments()
  return <AdoptionPaymentsClient payments={result.success ? (result.data ?? []) : []} />
}
