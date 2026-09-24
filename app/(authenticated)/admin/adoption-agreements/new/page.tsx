import prisma from 'prisma/client'
import { getDachshundsByStatus } from 'lib/actions/_rescue-groups/getDachshundsByStatus'
import { NewAdoptionAgreementClient } from './NewAdoptionAgreementClient'

const PAGE = { pageLimit: 250, currentPage: 1 }

export default async function NewAdoptionAgreementPage() {
  const [available, hold, taken] = await Promise.all([
    getDachshundsByStatus({ status: 'Available', ...PAGE, source: 'admin-agreement-available' }),
    getDachshundsByStatus({ status: 'Hold', ...PAGE, source: 'admin-agreement-hold' }),
    prisma.adoptionAgreement.findMany({
      where: { status: { in: ['DRAFT', 'SENT', 'SIGNED', 'PAID', 'COMPLETE'] } },
      select: { dogRescueGroupsId: true, status: true }
    })
  ])

  // An adoption completed here may not be reflected in RescueGroups yet, so the site's record decides.
  // In progress wins over adopted if a dog somehow has both
  const unavailable: Record<string, string> = {}
  for (const t of taken) {
    if (t.status === 'COMPLETE') unavailable[t.dogRescueGroupsId] ??= 'Adopted'
    else unavailable[t.dogRescueGroupsId] = 'Agreement in progress'
  }

  const toOptions = (list: typeof available.data) =>
    (list?.data ?? [])
      .map((d) => ({
        id: d.id,
        name: d.attributes.name,
        photo: d.attributes.photos?.[0] ?? null,
        colorDetails: d.attributes.colorDetails || null
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <NewAdoptionAgreementClient availableDogs={toOptions(available.data)} holdDogs={toOptions(hold.data)} unavailableDogs={unavailable} />
  )
}
