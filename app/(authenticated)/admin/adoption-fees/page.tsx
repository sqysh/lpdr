import { getAdoptionFees } from 'lib/actions/admin/adoption-fee/getAdoptionFees'
import AdminAdoptionFeesClient from './AdminAdoptionFeesClient'

export default async function AdminAdoptionFeesPage() {
  const result = await getAdoptionFees()
  const serializedFees = result.data.map((f: { feeAmount: any }) => ({
    ...f,
    feeAmount: Number(f.feeAmount)
  }))
  return <AdminAdoptionFeesClient fees={serializedFees} />
}
