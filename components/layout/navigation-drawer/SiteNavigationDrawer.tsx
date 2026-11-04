import NavigationDrawer from './NavigationDrawer'
import { hasActiveAdoptionFee } from 'lib/actions/adoption-fee/hasActiveAdoptionFee'
import { isMemorialsEnabled } from 'lib/actions/public/memorial/isMemorialsEnabled'

export const SiteNavigationDrawer = async () => {
  const [hasActiveFee, memorialsEnabled] = await Promise.all([hasActiveAdoptionFee(), isMemorialsEnabled()])
  return <NavigationDrawer hasActiveFee={hasActiveFee.isActive} memorialsEnabled={memorialsEnabled} />
}
