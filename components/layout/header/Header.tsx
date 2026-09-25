import { hasSessionCookie } from 'lib/actions/_infra/cookie-flags'
import { HeaderClient } from './HeaderClient'
import { hasActiveAdoptionFee } from 'lib/actions/adoption-fee/hasActiveAdoptionFee'
import { auth } from 'lib/auth'

export async function Header() {
  const [isAuthed, hasActiveFee, session] = await Promise.all([hasSessionCookie(), hasActiveAdoptionFee(), auth()])
  return <HeaderClient hasActiveFee={hasActiveFee.isActive} isAuthed={isAuthed} userRole={session?.user?.role ?? null} />
}
