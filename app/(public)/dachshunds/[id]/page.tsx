import DachshundDetailClient from 'app/(public)/dachshunds/[id]/DachshundDetailClient'
import { DachshundFixedFooterNav } from 'app/(public)/dachshunds/[id]/_components/DachshundFixedFooterNav'
import { getDachshundById } from 'lib/actions/_rescue-groups/getDachshundById'
import { getDachshundsByStatus } from 'lib/actions/_rescue-groups/getDachshundsByStatus'
import { notFound, redirect } from 'next/navigation'

export default async function DachshundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // RescueGroups ids are numeric. A run-on link, like a post where "Apply" ran into the URL, still has the
  // real id at the start, so it's sent to that dog instead of an error; anything without one is not found
  const digits = id.match(/^\d+/)?.[0]
  if (!digits) notFound()
  if (digits !== id) redirect(`/dachshunds/${digits}`)

  // Same arguments as the grid, so this reuses its cached list rather than asking RescueGroups again
  const [result, list] = await Promise.all([
    getDachshundById(id),
    getDachshundsByStatus({ status: 'Available', pageLimit: 250, currentPage: 1, source: 'dachshund-detail' })
  ])

  if (!result.success) {
    if (result.error === 'Dachshund not found') notFound()
    // RescueGroups was unreachable. Throwing keeps the last good version of the page if Next has one,
    // and otherwise shows the error page with a retry, instead of telling a supporter this dog doesn't exist
    throw new Error(result.error ?? 'Failed to fetch dachshund')
  }
  if (!result.data?.data?.[0]) notFound()

  // The bar steps through the grid in the grid's order. A dog that isn't in it, like one on hold or
  // opened from an old link, gets no bar rather than neighbours that make no sense. If the list
  // failed to load, the page still shows, just without the bar
  const dogs: { id: string | number; attributes?: { name?: string } }[] = list.success ? (list.data?.data ?? []) : []
  const index = dogs.findIndex((dog) => String(dog.id) === id)
  const neighbour = (i: number) => (dogs[i] ? { id: String(dogs[i].id), name: dogs[i].attributes?.name ?? 'Dachshund' } : null)

  return (
    <>
      <DachshundDetailClient data={result.data.data[0]} />
      {index > -1 && (
        <DachshundFixedFooterNav prev={neighbour(index - 1)} next={neighbour(index + 1)} position={index + 1} total={dogs.length} />
      )}
    </>
  )
}
