import DachshundDetailClient from 'app/(public)/dachshunds/[id]/DachshundDetailClient'
import { getDachshundById } from 'lib/actions/_rescue-groups/getDachshundById'
import { notFound } from 'next/navigation'

export default async function DachshundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getDachshundById(id)
  if (!result.success || !result.data) notFound()

  return <DachshundDetailClient data={result?.data?.data[0]} />
}
