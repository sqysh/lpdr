import { hasSessionCookie } from 'lib/actions/_infra/cookie-flags'
import { HeaderClient } from './HeaderClient'
import { hasActiveAdoptionFee } from 'lib/actions/adoption-fee/hasActiveAdoptionFee'
import { auth } from 'lib/auth'
import { isMemorialsEnabled } from 'lib/actions/public/memorial/isMemorialsEnabled'

export async function Header() {
  const [isAuthed, hasActiveFee, session, memorialsEnabled] = await Promise.all([
    hasSessionCookie(),
    hasActiveAdoptionFee(),
    auth(),
    isMemorialsEnabled()
  ])

  return (
    <HeaderClient
      hasActiveFee={hasActiveFee.isActive}
      isAuthed={isAuthed}
      userRole={session?.user?.role ?? null}
      memorialsEnabled={memorialsEnabled}
    />
  )
}
