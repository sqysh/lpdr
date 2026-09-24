import { notFound, redirect } from 'next/navigation'
import { getAdoptionAgreementById } from 'lib/actions/admin/adoption-agreement/getAdoptionAgreementById'
import { EditAdoptionAgreementClient } from './EditAdoptionAgreementClient'

export default async function EditAdoptionAgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getAdoptionAgreementById(id)

  if (!result.success || !result.data) notFound()

  // Signed agreements are what the adopter agreed to, so they go back to the read-only view
  if (result.data.status !== 'DRAFT' && result.data.status !== 'SENT') redirect(`/admin/adoption-agreements/${id}`)

  return <EditAdoptionAgreementClient agreement={result.data} />
}
