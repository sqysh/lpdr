import { HomeClient } from './HomeClient'
import { getDachshundsByStatus } from 'lib/actions/_rescue-groups/getDachshundsByStatus'
import { getLiveWelcomeWieners } from 'lib/actions/public/welcome-wiener/getLiveWelcomeWieners'
import { getNavAuction } from 'lib/actions/public/auction/getNavAuction'

export default async function HomePage() {
  const [dachshunds, welcomeWieners, navAuction] = await Promise.all([
    getDachshundsByStatus({ status: 'Available', pageLimit: 250, currentPage: 1, source: 'home' }),
    getLiveWelcomeWieners(),
    getNavAuction()
  ])

  // Live, or upcoming once the crew has made it public. Anything else is not news.
  const auction =
    navAuction && (navAuction.status === 'ACTIVE' || (navAuction.status === 'DRAFT' && navAuction.isPubliclyVisible)) ? navAuction : null

  return <HomeClient dachshunds={dachshunds} welcomeWieners={welcomeWieners} auction={auction} />
}
