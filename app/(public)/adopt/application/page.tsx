import { redirect } from 'next/navigation'
import AdoptionApplicationClient from 'app/(public)/adopt/application/AdoptionApplicationClient'
import { hasActiveAdoptionFee } from 'lib/actions/my-pack/adoption-fee/hasActiveAdoptionFee'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdoptionApplicationApplyPage() {
  const result = await hasActiveAdoptionFee().catch(() => ({ isActive: false, expiresAt: null }))

  if (!result?.isActive) {
    redirect('/adopt')
  }

  return <AdoptionApplicationClient expiresAt={result.expiresAt ?? null} />
}
