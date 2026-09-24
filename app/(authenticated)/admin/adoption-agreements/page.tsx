import { getAdoptionAgreements } from 'lib/actions/admin/adoption-agreement/getAdoptionAgreements'
import { AdoptionAgreementsClient } from './AdoptionAgreementsClient'

export default async function AdoptionAgreementsPage() {
  const result = await getAdoptionAgreements()
  const agreements = result.success ? (result.data ?? []) : []

  return <AdoptionAgreementsClient agreements={agreements} />
}
