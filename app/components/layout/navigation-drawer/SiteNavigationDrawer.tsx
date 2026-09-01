import { hasActiveAdoptionFee } from 'lib/actions/_infra/cookie-flags'
import { getCachedAuction } from 'lib/actions/public/auction/getCachedAuction'
import NavigationDrawer from './NavigationDrawer'

export const SiteNavigationDrawer = async () => {
  const [hasActiveFee, auction] = await Promise.all([hasActiveAdoptionFee(), getCachedAuction()])
  return <NavigationDrawer auction={auction} hasActiveFee={hasActiveFee} />
}
