import { redirect } from 'next/navigation'
import AdoptionApplicationClient from 'app/(public)/adopt/application/AdoptionApplicationClient'
import { hasActiveAdoptionFee } from 'lib/actions/my-pack/adoption-fee/hasActiveAdoptionFee'

export default async function AdoptionApplicationPage() {
  const { isActive, expiresAt } = await hasActiveAdoptionFee()

  if (!isActive) {
    redirect('/adopt')
  }

  return <AdoptionApplicationClient expiresAt={expiresAt} />
}
