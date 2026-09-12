import { getCachedAuction } from 'lib/actions/public/auction/getCachedAuction'
import NavigationDrawer from './NavigationDrawer'
import { hasActiveAdoptionFee } from 'lib/actions/adoption-fee/hasActiveAdoptionFee'

export const SiteNavigationDrawer = async () => {
  const [hasActiveFee, auction] = await Promise.all([hasActiveAdoptionFee(), getCachedAuction()])
  return <NavigationDrawer auction={auction} hasActiveFee={hasActiveFee.isActive} />
}
