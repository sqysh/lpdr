import { SuperLogsClient } from './SuperLogsClient'
import { fetchLogs } from 'lib/actions/super-user/fetchLogs'
import Link from 'next/link'

export const metadata = { title: 'Logs — LPDR Super' }

export default async function SuperLogsPage() {
  const result = await fetchLogs({})
  const initialData = result.success ? result.data : []
  const initialTotal = result.success ? result.total : 0

  return (
    <div className="flex flex-col h-screen bg-bg-light dark:bg-bg-dark overflow-hidden">
      {/* Header */}
      <div className="flex items-baseline gap-3 px-6 py-5 border-b border-border-light dark:border-border-dark">
        <Link
          href="/super"
          className="font-mono text-f10 tracking-widest uppercase text-muted-light dark:text-muted-dark"
        >
          Super
        </Link>
        <span className="font-mono text-muted-light dark:text-muted-dark text-f10">/</span>
        <span className="font-mono text-f10 tracking-widest uppercase text-text-light dark:text-text-dark">
          Logs
        </span>
      </div>

      {/* Full-bleed table */}
      <div className="flex-1 overflow-hidden">
        <SuperLogsClient initialData={initialData} initialTotal={initialTotal} />
      </div>
    </div>
  )
}
