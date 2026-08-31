'use client'

import { useState } from 'react'
import { AlertCircle, RefreshCw, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { diagnoseMigration } from 'lib/actions/admin/user/diagnoseMigration'
import { retriggerMigration } from 'lib/actions/admin/user/retriggerMigration'

export function MigrationTroubleshootPanel({ userId }: { userId: string }) {
  const router = useRouter()
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [retriggering, setRetriggering] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleDiagnose = async () => {
    setDiagnosing(true)
    const res = await diagnoseMigration(userId)
    setDiagnosing(false)
    if (res.success) setDiagnosis(res.data)
  }

  const handleRetrigger = async () => {
    setRetriggering(true)
    setResult(null)
    const res = await retriggerMigration(userId)
    setRetriggering(false)
    setResult({
      success: res.success,
      message: res.success ? 'Migration completed successfully.' : (res.error ?? 'Failed')
    })
    if (res.success) {
      setDiagnosis(null)
      router.refresh()
    }
  }

  return (
    <div className="border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle
          className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-amber-600 dark:text-amber-400">
          Migration troubleshooting
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDiagnose}
          disabled={diagnosing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-[0.15em] uppercase border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors disabled:opacity-50"
        >
          <Search className="w-3 h-3" aria-hidden="true" />
          {diagnosing ? 'Checking...' : 'Diagnose'}
        </button>
        <button
          type="button"
          onClick={handleRetrigger}
          disabled={retriggering}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-[0.15em] uppercase bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3 h-3 ${retriggering ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          {retriggering ? 'Running...' : 'Re-run migration'}
        </button>
      </div>

      {diagnosis && (
        <div className="text-[11px] font-mono text-text-light dark:text-text-dark space-y-1 pt-2 border-t border-amber-500/20">
          <p>Has migrated: {String(diagnosis.hasMigrated)}</p>
          <p>Staging user record exists: {String(diagnosis.hasStagingUserRecord)}</p>
          <p>Records still pending: {diagnosis.totalRemaining}</p>
          {diagnosis.totalRemaining > 0 && (
            <ul className="pl-3 text-muted-light dark:text-muted-dark">
              {Object.entries(diagnosis.remainingStagingRecords)
                .filter(([, v]) => (v as number) > 0)
                .map(([k, v]) => (
                  <li key={k}>
                    {k}: {v as number}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {result && (
        <p
          className={`text-[11px] font-mono ${result.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {result.message}
        </p>
      )}
    </div>
  )
}
