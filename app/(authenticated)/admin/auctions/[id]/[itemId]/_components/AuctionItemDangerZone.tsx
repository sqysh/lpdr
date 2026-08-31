import { CheckCheck, Loader2, Trash2 } from 'lucide-react'

type Props = {
  deleting: boolean
  confirmDel: boolean
  onDelete: () => void
  onCancelDelete: () => void
}

export function AuctionItemDangerZone({ deleting, confirmDel, onDelete, onCancelDelete }: Props) {
  return (
    <div className="border border-red-500/20 bg-red-500/5">
      <div className="px-4 py-3 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <span className="block w-3 h-px bg-red-500 shrink-0" aria-hidden="true" />
          <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-red-500">Danger Zone</p>
        </div>
      </div>
      <div className="px-4 py-4">
        <p className="text-xs font-semibold text-text-light dark:text-text-dark mb-0.5">Delete Item</p>
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mb-4 leading-relaxed">
          Permanently removes this item and its data. Photos are removed from our records but may remain in storage.
        </p>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          aria-busy={deleting}
          className={`w-full py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 ${
            confirmDel
              ? 'border border-transparent bg-red-500 text-white'
              : 'border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white'
          }`}
        >
          {deleting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={12} className="animate-spin" aria-hidden="true" /> Deleting...
            </span>
          ) : confirmDel ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCheck size={12} aria-hidden="true" /> Confirm Delete
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Trash2 size={12} aria-hidden="true" /> Delete Item
            </span>
          )}
        </button>
        {confirmDel && (
          <button
            type="button"
            onClick={onCancelDelete}
            className="w-full py-2 text-[10px] font-mono text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors mt-1"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
