import { HomeClient } from './HomeClient'
import { getDachshundsByStatus } from '../../../lib/actions/_rescue-groups/getDachshundsByStatus'
import { getLiveWelcomeWieners } from '../../../lib/actions/public/welcome-wiener/getLiveWelcomeWieners'

export default async function HomePage() {
  const [dachshunds, welcomeWieners] = await Promise.all([
    getDachshundsByStatus({ status: 'Available', pageLimit: 250, currentPage: 1, source: 'home' }),
    getLiveWelcomeWieners()
  ])

  return <HomeClient dachshunds={dachshunds} welcomeWieners={welcomeWieners} />
}
