import { requireAccessPage } from 'lib/auth/guards'

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireAccessPage('MONEY')
  return children
}
