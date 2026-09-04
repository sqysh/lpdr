import { CronJob, getCronJobs } from 'lib/actions/super-user/getCronJobs'
import { useState } from 'react'
import { PanelHeader } from './PanelHeader'
import { RotateCcw } from 'lucide-react'

const cronStatusColor: Record<string, string> = {
  success: 'text-green-500',
  error: 'text-red-500',
  skipped: 'text-amber-500',
  never: 'text-muted-light dark:text-muted-dark'
}

const CRON_ROUTES: Record<string, string> = {
  'cron_auction-updated': '/api/cron/auction-updated',
  'cron_end-auction': '/api/cron/end-auction',
  'cron_expire-adoption-fees': '/api/cron/expire-adoption-fees',
  'cron_rotate-bypass-code': '/api/cron/rotate-bypass-code',
  'cron_start-auction': '/api/cron/start-auction',
  'cron_winner-payment-reminder': '/api/cron/winner-payment-reminder'
}

export function CronStrip({ initialJobs }: { initialJobs: CronJob[] }) {
  const [jobs, setJobs] = useState<CronJob[]>(initialJobs)
  const [triggering, setTriggering] = useState<string | null>(null)

  async function triggerJob(id: string) {
    const route = CRON_ROUTES[id]
    if (!route) return
    setTriggering(id)
    try {
      await fetch(route)
      const fresh = await getCronJobs()
      setJobs(fresh.data ?? [])
    } finally {
      setTriggering(null)
    }
  }

  return (
    <div className="flex flex-col border-t border-border-light dark:border-border-dark shrink-0">
      <PanelHeader
        label="Cron Jobs"
        action={
          <span className="font-mono text-[8px] text-muted-light dark:text-muted-dark">
            {jobs.filter((j) => j.enabled).length} active · {jobs.filter((j) => j.lastStatus === 'error').length} errored
          </span>
        }
      />
      <div className="flex divide-x divide-border-light dark:divide-border-dark overflow-x-auto">
        {jobs.map((job) => (
          <div key={job.id} className={`flex flex-col gap-1 px-3 py-2 shrink-0 min-w-40 ${!job.enabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[9px] uppercase text-text-light dark:text-text-dark truncate">{job.name}</p>
              <span className={`font-mono text-[8px] uppercase font-bold ${cronStatusColor[job.lastStatus]}`}>
                {job.lastStatus}
              </span>
            </div>
            <p className="font-mono text-[8px] text-muted-light dark:text-muted-dark">
              {job.schedule} · {job.lastRan ?? 'never'}
            </p>
            <button
              onClick={() => triggerJob(job.id)}
              disabled={!job.enabled || triggering === job.id}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[8px] uppercase border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark disabled:opacity-30 transition-colors focus:outline-none w-fit"
            >
              <RotateCcw size={8} className={triggering === job.id ? 'animate-spin' : ''} aria-hidden="true" />
              Run
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
