import { notFound } from 'next/navigation'
import prisma from 'prisma/client'
import { IWelcomeWiener } from 'types/welcome-wiener'
import { WelcomeWienerForm } from '../_components/WelcomeWienerForm'

export default async function AdminWelcomeWienersEditPage({
  params
}: {
  params: Promise<{ welcomeWienerId: string }>
}) {
  const { welcomeWienerId } = await params

  const welcomeWiener = await prisma.welcomeWiener.findUnique({ where: { id: welcomeWienerId } })
  if (!welcomeWiener) notFound()

  return <WelcomeWienerForm welcomeWiener={welcomeWiener as unknown as IWelcomeWiener} />
}
