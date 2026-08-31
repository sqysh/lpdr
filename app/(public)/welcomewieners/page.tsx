import { PublicWelcomeWienersClient } from 'app/(public)/welcomewieners/PublicWelcomeWienersClient'
import { getLiveWelcomeWieners } from 'lib/actions/public/welcome-wiener/getLiveWelcomeWieners'

export default async function PublicWelcomeWienersPage() {
  const result = await getLiveWelcomeWieners()
  return <PublicWelcomeWienersClient welcomeWieners={result.data} />
}
