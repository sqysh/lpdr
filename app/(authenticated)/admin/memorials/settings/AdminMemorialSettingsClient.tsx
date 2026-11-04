'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { formatDate } from 'lib/utils/date.utils'
import { updateMemorialSettings } from 'lib/actions/admin/memorial/updateMemorialSettings'
import { LinkBody } from 'components/_common/LinkBody'

export type AdminMemorialSettings = {
  isEnabled: boolean
  fixedAmount: number | null
  minAmount: number
  suggestedAmounts: number[]
  allowMessage: boolean
  messageMaxLength: number
  allowPhoto: boolean
  allowDonorName: boolean
  requireApproval: boolean
  displayDays: number | null
  updatedAt: string
}

const labelClass = 'block text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-1.5'
const inputClass =
  'w-full px-3 py-2 text-sm border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark disabled:opacity-50'
const hintClass = 'mt-1 text-[11px] font-mono text-muted-light dark:text-muted-dark'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <h2 className="px-5 py-3 border-b border-border-light dark:border-border-dark text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
        {title}
      </h2>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </section>
  )
}

function Toggle({
  id,
  label,
  hint,
  checked,
  onChange
}: {
  id: string
  label: string
  hint?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex items-start justify-between gap-6 cursor-pointer">
      <span>
        <span className="block text-sm text-text-light dark:text-text-dark">{label}</span>
        {hint && <span className={`block ${hintClass}`}>{hint}</span>}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 shrink-0 accent-primary-light dark:accent-primary-dark"
      />
    </label>
  )
}

const toAmount = (value: string) => Number(value.replace(/[^0-9.]/g, ''))

export function AdminMemorialSettingsClient({ settings }: { settings: AdminMemorialSettings }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ kind: 'saved' | 'error'; text: string } | null>(null)

  // Numbers are held as text while editing so a half-typed amount doesn't snap to 0
  const [form, setForm] = useState({
    isEnabled: settings.isEnabled,
    pricing: settings.fixedAmount != null ? 'FIXED' : 'MINIMUM',
    minAmount: String(settings.minAmount),
    fixedAmount: settings.fixedAmount != null ? String(settings.fixedAmount) : '',
    suggestedAmounts: settings.suggestedAmounts.join(', '),
    allowMessage: settings.allowMessage,
    messageMaxLength: String(settings.messageMaxLength),
    allowPhoto: settings.allowPhoto,
    allowDonorName: settings.allowDonorName,
    requireApproval: settings.requireApproval,
    keepForever: settings.displayDays == null,
    displayDays: String(settings.displayDays ?? 365)
  })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setStatus(null)
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
    const isFixed = form.pricing === 'FIXED'
    const suggested = form.suggestedAmounts
      .split(',')
      .map((v) => toAmount(v))
      .filter((v) => v > 0)

    startTransition(async () => {
      const result = await updateMemorialSettings({
        isEnabled: form.isEnabled,
        fixedAmount: isFixed ? toAmount(form.fixedAmount) : null,
        minAmount: toAmount(form.minAmount),
        suggestedAmounts: isFixed ? [] : suggested,
        allowMessage: form.allowMessage,
        messageMaxLength: Math.round(toAmount(form.messageMaxLength)),
        allowPhoto: form.allowPhoto,
        allowDonorName: form.allowDonorName,
        requireApproval: form.requireApproval,
        displayDays: form.keepForever ? null : Math.round(toAmount(form.displayDays))
      })

      setStatus(
        result.success
          ? { kind: 'saved', text: 'Saved. The memorial page uses these settings now.' }
          : { kind: 'error', text: result.error ?? "We couldn't save the settings. Please try again." }
      )
    })
  }

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Rainbow Bridge Settings" />

      <div className="w-full max-w-3xl px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/memorials"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark"
          >
            <LinkBody
              icon={<ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />}
              label="Back to memorials"
              spinnerClass="w-3.5 h-3.5"
            />
          </Link>
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">Last changed {formatDate(settings.updatedAt, true)}</p>
        </div>

        <Section title="Memorial page">
          <Toggle
            id="isEnabled"
            label="Accept memorial gifts"
            hint="When this is off, the memorial form is closed. Memorials already on the Rainbow Bridge stay up."
            checked={form.isEnabled}
            onChange={(v) => set('isEnabled', v)}
          />
        </Section>

        <Section title="Gift amount">
          <fieldset className="space-y-2">
            <legend className={labelClass}>How much people give</legend>
            {[
              { value: 'MINIMUM', label: 'Donor chooses, with a minimum' },
              { value: 'FIXED', label: 'Everyone gives the same amount' }
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-text-light dark:text-text-dark cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  value={option.value}
                  checked={form.pricing === option.value}
                  onChange={() => set('pricing', option.value)}
                  className="w-4 h-4 accent-primary-light dark:accent-primary-dark"
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          {form.pricing === 'FIXED' ? (
            <div>
              <label htmlFor="fixedAmount" className={labelClass}>
                Gift amount ($)
              </label>
              <input
                id="fixedAmount"
                inputMode="decimal"
                value={form.fixedAmount}
                onChange={(e) => set('fixedAmount', e.target.value)}
                className={inputClass}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="minAmount" className={labelClass}>
                  Minimum ($)
                </label>
                <input
                  id="minAmount"
                  inputMode="decimal"
                  value={form.minAmount}
                  onChange={(e) => set('minAmount', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="suggestedAmounts" className={labelClass}>
                  Suggested amounts ($)
                </label>
                <input
                  id="suggestedAmounts"
                  value={form.suggestedAmounts}
                  onChange={(e) => set('suggestedAmounts', e.target.value)}
                  placeholder="18, 50, 100"
                  aria-describedby="suggestedAmounts-hint"
                  className={inputClass}
                />
                <p id="suggestedAmounts-hint" className={hintClass}>
                  Separated by commas, up to 6. These are the quick-pick buttons on the form.
                </p>
              </div>
            </div>
          )}
        </Section>

        <Section title="What donors can add">
          <Toggle id="allowPhoto" label="A photo of their dog" checked={form.allowPhoto} onChange={(v) => set('allowPhoto', v)} />
          <Toggle
            id="allowDonorName"
            label="Their name on the memorial"
            hint='Donors still choose for themselves. Shows as "Loved by the Smith family".'
            checked={form.allowDonorName}
            onChange={(v) => set('allowDonorName', v)}
          />
          <Toggle id="allowMessage" label="A short message" checked={form.allowMessage} onChange={(v) => set('allowMessage', v)} />
          {form.allowMessage && (
            <div className="sm:w-1/2">
              <label htmlFor="messageMaxLength" className={labelClass}>
                Longest message (characters)
              </label>
              <input
                id="messageMaxLength"
                inputMode="numeric"
                value={form.messageMaxLength}
                onChange={(e) => set('messageMaxLength', e.target.value)}
                aria-describedby="messageMaxLength-hint"
                className={inputClass}
              />
              <p id="messageMaxLength-hint" className={hintClass}>
                Up to 500.
              </p>
            </div>
          )}
        </Section>

        <Section title="Review and display">
          <Toggle
            id="requireApproval"
            label="Review each memorial before it goes up"
            hint="Memorials wait under Waiting for review until someone approves them."
            checked={form.requireApproval}
            onChange={(v) => set('requireApproval', v)}
          />
          <Toggle id="keepForever" label="Keep memorials up forever" checked={form.keepForever} onChange={(v) => set('keepForever', v)} />
          {!form.keepForever && (
            <div className="sm:w-1/2">
              <label htmlFor="displayDays" className={labelClass}>
                Days on the wall
              </label>
              <input
                id="displayDays"
                inputMode="numeric"
                value={form.displayDays}
                onChange={(e) => set('displayDays', e.target.value)}
                aria-describedby="displayDays-hint"
                className={inputClass}
              />
              <p id="displayDays-hint" className={hintClass}>
                Counted from when each memorial is approved. Changing this affects memorials approved from now on.
              </p>
            </div>
          )}
        </Section>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-mono tracking-eyebrow uppercase text-white bg-primary-light dark:bg-primary-dark hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
            Save settings
          </button>
          {status && (
            <p
              role={status.kind === 'error' ? 'alert' : 'status'}
              className={`text-[11px] font-mono ${status.kind === 'error' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
            >
              {status.text}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
