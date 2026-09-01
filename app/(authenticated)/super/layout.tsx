import { requireSuperPage } from 'lib/auth/guards'

export default async function SuperLayout({ children }: { children: React.ReactNode }) {
  await requireSuperPage()
  return <>{children}</>
}
