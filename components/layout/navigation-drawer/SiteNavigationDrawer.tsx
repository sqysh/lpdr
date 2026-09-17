import NavigationDrawer from './NavigationDrawer'
import { hasActiveAdoptionFee } from 'lib/actions/adoption-fee/hasActiveAdoptionFee'

export const SiteNavigationDrawer = async () => {
  const hasActiveFee = await hasActiveAdoptionFee()
  return <NavigationDrawer hasActiveFee={hasActiveFee.isActive} />
}
