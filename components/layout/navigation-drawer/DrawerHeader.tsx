import { X } from 'lucide-react'

export function DrawerHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="sticky top-0 z-10 bg-bg-light dark:bg-bg-dark border-b border-border-light dark:border-border-dark px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-4 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
        <span className="text-f10 uppercase tracking-[0.25em] text-primary-light dark:text-primary-dark">
          Little Paws
        </span>
      </div>
      <button
        onClick={onClose}
        aria-label="Close menu"
        className="p-1.5 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  )
}
