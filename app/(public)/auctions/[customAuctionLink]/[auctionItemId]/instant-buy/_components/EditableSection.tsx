import { Loader2 } from 'lucide-react'

type Props = {
  label: string
  hint?: string
  editing: boolean
  saving: boolean
  showCancel: boolean
  saveLabel: string
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  summary: React.ReactNode
  children: React.ReactNode
}

export function EditableSection({
  label,
  hint,
  editing,
  saving,
  showCancel,
  saveLabel,
  onEdit,
  onCancel,
  onSave,
  summary,
  children
}: Props) {
  return (
    <section
      aria-label={editing ? `Enter ${label.toLowerCase()}` : label}
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-start justify-between gap-3">
        <div>
          <h2 className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">{label}</h2>
          {editing && hint && <p className="font-lato text-xs text-muted-light dark:text-muted-dark mt-0.5">{hint}</p>}
        </div>

        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-f10 uppercase tracking-[0.2em] text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="px-4 py-4 space-y-3">
          {children}

          <div className="flex gap-3">
            {showCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="flex-1 py-2.5 px-4 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-f10 uppercase tracking-[0.25em] hover:text-text-light dark:hover:text-text-dark transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-f10 uppercase tracking-[0.25em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
              {saving ? 'Saving...' : saveLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-0.5">{summary}</div>
      )}
    </section>
  )
}
