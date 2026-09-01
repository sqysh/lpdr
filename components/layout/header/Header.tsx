import { hasActiveAdoptionFee, hasSessionCookie } from 'lib/actions/_infra/cookie-flags'
import { getCachedAuction } from 'lib/actions/public/auction/getCachedAuction'
import { HeaderClient } from './HeaderClient'

export async function Header() {
  const [isAuthed, hasActiveFee, auction] = await Promise.all([
    hasSessionCookie(),
    hasActiveAdoptionFee(),
    getCachedAuction()
  ])
  return <HeaderClient auction={auction} hasActiveFee={hasActiveFee} isAuthed={isAuthed} />
}
