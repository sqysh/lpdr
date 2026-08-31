'use client'

import { UserPlus } from 'lucide-react'

export function GrantAdminAccessTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
      Grant Admin Access
    </button>
  )
}
