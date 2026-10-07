'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AdminArea } from '@prisma/client'
import { ADMIN_AREA_LABELS } from 'lib/auth/access'
import { updateAdminAreas } from 'lib/actions/super-user/updateAdminAreas'

const AREAS = Object.keys(ADMIN_AREA_LABELS) as AdminArea[]

export function AdminAreasPanel({ userId, initial }: { userId: string; initial: AdminArea[] }) {
  const router = useRouter()
  const [areas, setAreas] = useState<AdminArea[]>(initial)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, startSaving] = useTransition()

  const changed = areas.length !== initial.length || areas.some((a) => !initial.includes(a))

  const toggle = (area: AdminArea) => {
    setSaved(false)
    setAreas((current) => (current.includes(area) ? current.filter((a) => a !== area) : [...current, area]))
  }

  const save = () =>
    startSaving(async () => {
      setError(null)
      const result = await updateAdminAreas({ userId, areas })
      if (!result.success) return setError(result.error ?? 'Could not save access.')
      setSaved(true)
      router.refresh()
    })

  return (
    <section className="border border-border-light dark:border-border-dark">
      <div className="px-5 py-3 border-b border-border-light dark:border-border-dark">
        <h2 className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">Admin access</h2>
        <p className="mt-1 text-xs text-muted-light dark:text-muted-dark">Which parts of the admin this person can open.</p>
      </div>

      <fieldset className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-1">
        <legend className="sr-only">Admin areas</legend>
        {AREAS.map((area) => (
          <label key={area} className="flex items-center gap-3 min-h-8 text-xs text-text-light dark:text-text-dark cursor-pointer">
            <input
              type="checkbox"
              checked={areas.includes(area)}
              onChange={() => toggle(area)}
              className="accent-primary-light dark:accent-primary-dark"
            />
            {ADMIN_AREA_LABELS[area]}
          </label>
        ))}
      </fieldset>

      <div className="px-5 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={!changed || saving}
          className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase bg-primary-light dark:bg-primary-dark text-white disabled:opacity-40"
        >
          {saving ? 'Saving' : 'Save access'}
        </button>
        {saved && !changed && <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">Saved</span>}
        {error && (
          <span role="alert" className="text-[10px] font-mono text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
    </section>
  )
}
