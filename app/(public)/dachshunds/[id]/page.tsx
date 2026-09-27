import DachshundDetailClient from 'app/(public)/dachshunds/[id]/DachshundDetailClient'
import { getDachshundById } from 'lib/actions/_rescue-groups/getDachshundById'
import { notFound, redirect } from 'next/navigation'

export default async function DachshundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // RescueGroups ids are numeric. A run-on link, like a post where "Apply" ran into the URL, still has the
  // real id at the start, so it's sent to that dog instead of an error; anything without one is not found
  const digits = id.match(/^\d+/)?.[0]
  if (!digits) notFound()
  if (digits !== id) redirect(`/dachshunds/${digits}`)

  const result = await getDachshundById(id)
  if (!result.success || !result.data?.data?.[0]) notFound()

  return <DachshundDetailClient data={result.data.data[0]} />
}
