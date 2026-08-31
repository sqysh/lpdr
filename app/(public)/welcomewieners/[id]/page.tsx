import PublicWelcomeWienerClient from 'app/(public)/welcomewieners/[id]/PublicWelcomeWienerClient'
import { getWelcomeWienerById } from 'lib/actions/public/welcome-wiener/getWelcomeWIenerById'

export default async function PublicWelcomeWienerPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getWelcomeWienerById(id)
  return <PublicWelcomeWienerClient welcomeWiener={result?.data} />
}
