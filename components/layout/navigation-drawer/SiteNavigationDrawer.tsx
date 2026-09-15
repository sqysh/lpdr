import { getCachedNavAuction } from 'lib/actions/public/auction/getCachedNavAuction'
import NavigationDrawer from './NavigationDrawer'
import { hasActiveAdoptionFee } from 'lib/actions/adoption-fee/hasActiveAdoptionFee'

export const SiteNavigationDrawer = async () => {
  const [hasActiveFee, auction] = await Promise.all([hasActiveAdoptionFee(), getCachedNavAuction()])
  return <NavigationDrawer auction={auction} hasActiveFee={hasActiveFee.isActive} />
}
