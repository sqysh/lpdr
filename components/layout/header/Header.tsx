import { hasSessionCookie } from 'lib/actions/_infra/cookie-flags'
import { getCachedAuction } from 'lib/actions/public/auction/getCachedAuction'
import { HeaderClient } from './HeaderClient'
import { hasActiveAdoptionFee } from 'lib/actions/adoption-fee/hasActiveAdoptionFee'

export async function Header() {
  const [isAuthed, hasActiveFee, auction] = await Promise.all([hasSessionCookie(), hasActiveAdoptionFee(), getCachedAuction()])
  return <HeaderClient auction={auction} hasActiveFee={hasActiveFee.isActive} isAuthed={isAuthed} />
}
