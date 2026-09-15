import { hasSessionCookie } from 'lib/actions/_infra/cookie-flags'
import { HeaderClient } from './HeaderClient'
import { hasActiveAdoptionFee } from 'lib/actions/adoption-fee/hasActiveAdoptionFee'

export async function Header() {
  const [isAuthed, hasActiveFee] = await Promise.all([hasSessionCookie(), hasActiveAdoptionFee()])
  return <HeaderClient hasActiveFee={hasActiveFee.isActive} isAuthed={isAuthed} />
}
