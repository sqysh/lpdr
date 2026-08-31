'use client'

import { useState } from 'react'
import { Clock, X } from 'lucide-react'
import { revokePendingAdminInvite } from 'lib/actions/admin/user/revokePendingAdminInvite'

type Invite = { id: string; email: string; createdAt: Date; role: string }

export function PendingAdminInvitesList({
  invites,
  onRevoked
}: {
  invites: Invite[]
  onRevoked: () => void
}) {
  const [revoking, setRevoking] = useState<string | null>(null)

  if (invites.length === 0) return null

  const handleRevoke = async (email: string) => {
    setRevoking(email)
    await revokePendingAdminInvite(email)
    setRevoking(null)
    onRevoked()
  }

  return (
    <div className="border border-amber-500/30 bg-amber-500/5 mb-6">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-500/20">
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-amber-600 dark:text-amber-400">
          Waiting to sign in ({invites.length})
        </p>
      </div>
      <div className="divide-y divide-amber-500/10">
        {invites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <p className="text-xs font-mono text-text-light dark:text-text-dark">
                {invite.email}
              </p>
              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                Will become {invite.role} on first sign-in
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRevoke(invite.email)}
              disabled={revoking === invite.email}
              aria-label={`Revoke invite for ${invite.email}`}
              className="text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
