import { getAdoptionFees } from 'lib/actions/admin/adoption-fee/getAdoptionFees'
import AdminAdoptionFeesClient from './AdminAdoptionFeesClient'

export default async function AdminAdoptionFeesPage() {
  const result = await getAdoptionFees()
  return <AdminAdoptionFeesClient fees={result.data} />
}
