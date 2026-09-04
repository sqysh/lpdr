import { useRouter } from 'next/navigation'
import { IAuction } from 'types/auction.types'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Flag, Loader2, RotateCcw, Trash2, Zap } from 'lucide-react'
import { Role } from '@prisma/client'
import { deleteAuction } from 'lib/actions/admin/auction/deleteAuction'
import { updateAuction } from 'lib/actions/admin/auction/updateAuction'
import { startAuction } from 'lib/actions/super-user/startAuction'
import { revertAuctionToDraft } from 'lib/actions/super-user/revertAuctionToDraft'
import { endAuctionManually } from 'lib/actions/super-user/endAuctionManually'
import { AuctionSettingsForm } from './AuctionSettingsForm'
import { ActionPanel } from './ActionPanel'
import { Status, StatusMessage } from 'components/_primitives/StatusMessage'

const dangerButton = `shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`

export function SettingsTab({ auction, role }: { auction: IAuction; role: Role }) {
  const router = useRouter()

  const [inputs, setInputs] = useState(auction)
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [starting, setStarting] = useState(false)
  const [reverting, setReverting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)

  const confirmEndTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isSuperUser = role === Role.SUPER_USER
  const isActive = inputs?.status === 'ACTIVE'
  const isDraft = inputs?.status === 'DRAFT'

  useEffect(() => {
    setInputs(auction)
  }, [auction])

  useEffect(() => {
    return () => {
      if (confirmEndTimeout.current) clearTimeout(confirmEndTimeout.current)
      if (statusTimeout.current) clearTimeout(statusTimeout.current)
    }
  }, [])

  const flash = (next: Status) => {
    if (statusTimeout.current) clearTimeout(statusTimeout.current)
    setStatus(next)
    statusTimeout.current = setTimeout(() => setStatus(null), 6000)
  }

  const handleInput = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    setLoading(true)
    setStatus(null)

    const result = await updateAuction(inputs.id, {
      title: inputs.title,
      goal: Number(inputs.goal),
      customAuctionLink: inputs.customAuctionLink || undefined,
      startDate: new Date(inputs.startDate),
      endDate: new Date(inputs.endDate)
    })

    setLoading(false)

    if (!result.success) {
      flash({
        tone: 'error',
        message: 'Failed to save changes',
        description: result.fieldErrors
          ? Object.entries(result.fieldErrors)
              .map(([field, msgs]) => `${field}: ${msgs[0]}`)
              .join(' · ')
          : (result.error ?? 'Something went wrong. Please try again.')
      })
      return
    }

    router.refresh()
    flash({
      tone: 'success',
      message: 'Auction settings saved',
      description: `"${inputs.title}" has been updated successfully.`
    })
  }

  const handleStart = async () => {
    setStarting(true)
    const result = await startAuction(auction.id)
    setStarting(false)

    if (!result.success) {
      flash({
        tone: 'error',
        message: 'Failed to start auction',
        description: result.error ?? 'Something went wrong.'
      })
      return
    }

    router.refresh()
    flash({
      tone: 'success',
      message: 'Auction started',
      description: `"${auction.title}" is now live.`
    })
  }

  const handleRevert = async () => {
    setReverting(true)
    const result = await revertAuctionToDraft(auction.id)
    setReverting(false)

    if (!result.success) {
      flash({
        tone: 'error',
        message: 'Failed to revert auction',
        description: result.error ?? 'Something went wrong.'
      })
      return
    }

    router.refresh()
    flash({
      tone: 'success',
      message: 'Auction reverted to draft',
      description: `"${auction.title}" is back in draft mode.`
    })
  }

  const handleEnd = async () => {
    if (!confirmEnd) {
      setConfirmEnd(true)
      confirmEndTimeout.current = setTimeout(() => setConfirmEnd(false), 4000)
      return
    }

    if (confirmEndTimeout.current) clearTimeout(confirmEndTimeout.current)

    setEnding(true)
    const result = await endAuctionManually(auction.id)
    setEnding(false)
    setConfirmEnd(false)

    if (!result.success) {
      flash({
        tone: 'error',
        message: 'Failed to end auction',
        description: result.error ?? 'Something went wrong.'
      })
      return
    }

    router.refresh()
    flash({
      tone: 'success',
      message: 'Auction ended',
      description: `"${auction.title}" has been ended and winners notified.`
    })
  }

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteAuction(inputs.id)

    if (!result.success) {
      setDeleting(false)
      flash({
        tone: 'error',
        message: 'Failed to delete auction',
        description: result.error ?? 'Something went wrong. Please try again.'
      })
      return
    }

    router.push('/admin/auctions')
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="border border-border-light dark:border-border-dark">
        <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
          <div className="flex items-center gap-3">
            <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
            <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Auction Settings
            </h2>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <StatusMessage status={status} />

          <AuctionSettingsForm
            inputs={inputs}
            isActive={auction.status === 'ACTIVE'}
            loading={loading}
            onInput={handleInput}
            onSave={handleSave}
          />

          {isActive && isSuperUser && (
            <ActionPanel
              accent="amber"
              sectionLabel="Caution"
              title="Revert to Draft"
              description="Takes the auction offline. Bidding will stop and the public page will no longer be accessible. Bids and items are preserved."
            >
              <button
                onClick={handleRevert}
                disabled={reverting}
                aria-label="Revert auction to draft"
                className={`${dangerButton} border border-amber-500/40 text-amber-500 hover:bg-amber-500 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-500`}
              >
                {reverting ? (
                  <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                ) : (
                  <RotateCcw size={11} aria-hidden="true" />
                )}
                {reverting ? 'Reverting...' : 'Revert to Draft'}
              </button>
            </ActionPanel>
          )}

          {isDraft && isSuperUser && (
            <ActionPanel
              accent="primary"
              sectionLabel="Launch"
              title="Start Auction Now"
              description="Manually activate this auction and notify bidders. The cron will no longer auto-start it."
            >
              <button
                onClick={handleStart}
                disabled={starting}
                aria-label="Start this auction manually"
                className={`${dangerButton} bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark`}
              >
                {starting ? (
                  <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Zap size={11} aria-hidden="true" />
                )}
                {starting ? 'Starting...' : 'Start Auction'}
              </button>
            </ActionPanel>
          )}

          {isActive && isSuperUser && (
            <ActionPanel
              accent="red"
              sectionLabel="End Auction"
              title="End Auction Now"
              description="Immediately ends the auction, resolves winners, and sends payment emails. This cannot be undone."
            >
              <button
                onClick={handleEnd}
                disabled={ending}
                aria-label="End auction manually"
                className={`${dangerButton} focus-visible:ring-2 focus-visible:ring-red-500 ${
                  confirmEnd
                    ? 'bg-red-500 text-white border border-transparent'
                    : 'border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white'
                }`}
              >
                {ending ? (
                  <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Flag size={11} aria-hidden="true" />
                )}
                {ending ? 'Ending...' : confirmEnd ? 'Confirm End' : 'End Auction'}
              </button>
            </ActionPanel>
          )}

          {isDraft && isSuperUser && (
            <ActionPanel
              accent="red"
              sectionLabel="Danger Zone"
              title="Delete Auction"
              description="Permanently delete this auction and all its items. This action cannot be undone."
            >
              <button
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete this auction permanently"
                className={`${dangerButton} border border-red-500/40 dark:border-red-400/40 text-red-500 dark:text-red-400 hover:bg-red-500 dark:hover:bg-red-400 hover:text-white dark:hover:text-bg-dark focus-visible:ring-2 focus-visible:ring-red-500 dark:focus-visible:ring-red-400`}
              >
                {deleting ? (
                  <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 size={11} aria-hidden="true" />
                )}
                {deleting ? 'Deleting...' : 'Delete Auction'}
              </button>
            </ActionPanel>
          )}
        </div>
      </div>
    </div>
  )
}
