import { notFound } from 'next/navigation'
import { getAdoptionAgreementById } from 'lib/actions/admin/adoption-agreement/getAdoptionAgreementById'
import { AdoptionAgreementDetailClient } from './AdoptionAgreementDetailClient'

export default async function AdoptionAgreementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getAdoptionAgreementById(id)

  if (!result.success || !result.data) notFound()

  return <AdoptionAgreementDetailClient agreement={result.data} />
}
