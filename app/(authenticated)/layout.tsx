import { requireAuthPage } from 'lib/auth/guards'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  await requireAuthPage()
  return <>{children}</>
}
