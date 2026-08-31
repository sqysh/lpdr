import { store } from 'lib/store/store'
import { useRouter } from 'next/navigation'
import { showToast } from 'lib/store/slices/toastSlice'
import { IAuction } from 'types/_auction'
import { ChangeEvent, useEffect, useState } from 'react'
import { toDatetimeLocal } from 'app/utils/_date.utils'
import { Flag, Loader2, RotateCcw, Trash2, Zap } from 'lucide-react'
import { deleteAuction } from 'lib/actions/admin/auction/deleteAuction'
import { updateAuction } from 'lib/actions/admin/auction/updateAuction'
import { startAuction } from 'lib/actions/super-user/startAuction'
import { revertAuctionToDraft } from 'lib/actions/super-user/revertAuctionToDraft'
import { endAuctionManually } from 'lib/actions/super-user/endAuctionManually'
import { useSession } from 'next-auth/react'

const inputStyles = `w-full px-3.5 py-3 text-xs font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark transition-colors scheme-light dark:scheme-dark`

export function SettingsTab({ auction }: { auction: IAuction }) {
  const router = useRouter()
  const [inputs, setInputs] = useState(auction)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [starting, setStarting] = useState(false)
  const [reverting, setReverting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const session = useSession()
  const isSuperUser = session.data?.user?.role === 'SUPER_USER'

  useEffect(() => {
    setInputs(auction)
  }, [auction])

  const handleInput = (
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDeleteAuction = async () => {
    setDeleting(true)

    const result = await deleteAuction(inputs.id)

    setDeleting(false)

    if (!result.success) {
      store.dispatch(
        showToast({
          message: 'Failed to delete auction',
          description: result.error ?? 'Something went wrong. Please try again.'
        })
      )
      return
    }

    store.dispatch(
      showToast({
        message: 'Auction deleted',
        description: `"${inputs.title}" has been permanently deleted.`
      })
    )

    router.push('/admin/auctions')
  }

  const handleSaveAuctionSettings = async () => {
    setLoading(true)

    const result = await updateAuction(inputs.id, {
      title: inputs.title,
      goal: inputs.goal,
      customAuctionLink: inputs.customAuctionLink ?? '',
      startDate: new Date(inputs.startDate),
      endDate: new Date(inputs.endDate)
    })

    setLoading(false)

    if (!result.success) {
      store.dispatch(
        showToast({
          message: 'Failed to save changes',
          description: result.error ?? 'Something went wrong. Please try again.'
        })
      )
      return
    }

    router.refresh()
    store.dispatch(
      showToast({
        message: 'Auction settings saved',
        description: `"${inputs.title}" has been updated successfully.`
      })
    )
  }

  const handleStartAuction = async () => {
    setStarting(true)
    const result = await startAuction(auction.id)
    setStarting(false)

    if (!result.success) {
      store.dispatch(
        showToast({
          message: 'Failed to start auction',
          description: result.error ?? 'Something went wrong.'
        })
      )
      return
    }

    router.refresh()
    store.dispatch(
      showToast({
        type: 'success',
        message: 'Auction started',
        description: `"${auction.title}" is now live.`
      })
    )
  }

  const handleRevertToDraft = async () => {
    setReverting(true)
    const result = await revertAuctionToDraft(auction.id)
    setReverting(false)

    if (!result.success) {
      store.dispatch(
        showToast({
          message: 'Failed to revert auction',
          description: result.error ?? 'Something went wrong.'
        })
      )
      return
    }

    router.refresh()
    store.dispatch(
      showToast({
        type: 'success',
        message: 'Auction reverted to draft',
        description: `"${auction.title}" is back in draft mode.`
      })
    )
  }

  const handleEndAuction = async () => {
    if (!confirmEnd) {
      setConfirmEnd(true)
      setTimeout(() => setConfirmEnd(false), 4000)
      return
    }

    setEnding(true)
    const result = await endAuctionManually(auction.id)
    setEnding(false)
    setConfirmEnd(false)

    if (!result.success) {
      store.dispatch(
        showToast({
          message: 'Failed to end auction',
          description: result.error ?? 'Something went wrong.'
        })
      )
      return
    }

    router.refresh()
    store.dispatch(
      showToast({
        type: 'success',
        message: 'Auction ended',
        description: `"${auction.title}" has been ended and winners notified.`
      })
    )
  }

  return (
    <div className="max-w-xl space-y-5">
      <div className="border border-border-light dark:border-border-dark">
        <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
          <div className="flex items-center gap-3">
            <span
              className="block w-4 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Auction Settings
            </h2>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              onChange={handleInput}
              value={inputs?.title || ''}
              className={inputStyles}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="startDate"
                className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
              >
                Start Date
              </label>
              <input
                disabled={auction.status === 'ACTIVE'}
                name="startDate"
                id="startDate"
                type="datetime-local"
                onChange={handleInput}
                value={toDatetimeLocal(inputs?.startDate) || ''}
                className={inputStyles}
              />
              {auction.status === 'ACTIVE' && (
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                  Start date cannot be changed once the auction is live
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="endDate"
                className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
              >
                End Date
              </label>
              <input
                name="endDate"
                id="endDate"
                type="datetime-local"
                onChange={handleInput}
                value={toDatetimeLocal(inputs?.endDate) || ''}
                className={inputStyles}
              />
            </div>
          </div>

          {/* Goal */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="goal"
              className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
            >
              Goal ($)
            </label>
            <input
              name="goal"
              id="goal"
              type="number"
              onChange={handleInput}
              value={inputs?.goal || ''}
              min={0}
              className={inputStyles}
            />
          </div>

          {/* Custom link */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="customLink"
              className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
            >
              Custom Link
            </label>
            <input
              name="customAuctionLink"
              id="customAuctionLink"
              type="text"
              onChange={handleInput}
              value={inputs?.customAuctionLink ?? ''}
              placeholder="e.g. spring-2026"
              className="w-full px-3.5 py-3 text-xs font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark transition-colors"
            />
          </div>

          {/* Save */}
          <div className="pt-2">
            <button
              onClick={handleSaveAuctionSettings}
              className="px-5 py-2.5 bg-primary-light dark:bg-primary-dark text-white text-[10px] font-mono tracking-[0.2em] uppercase hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>

          {/* Revert to draft — only for ACTIVE */}
          {inputs?.status === 'ACTIVE' && isSuperUser && (
            <div className="pt-6 mt-6 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-4 h-px bg-amber-500 shrink-0" aria-hidden="true" />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-500">
                  Caution
                </p>
              </div>
              <div className="border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-text-light dark:text-text-dark font-medium mb-0.5">
                    Revert to Draft
                  </p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                    Takes the auction offline. Bidding will stop and the public page will no longer
                    be accessible. Bids and items are preserved.
                  </p>
                </div>
                <button
                  onClick={handleRevertToDraft}
                  disabled={reverting}
                  aria-label="Revert auction to draft"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 border border-amber-500/40 text-amber-500 text-[10px] font-mono tracking-[0.2em] uppercase hover:bg-amber-500 hover:text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reverting ? (
                    <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <RotateCcw size={11} aria-hidden="true" />
                  )}
                  {reverting ? 'Reverting...' : 'Revert to Draft'}
                </button>
              </div>
            </div>
          )}

          {/* Start auction — only for DRAFT */}
          {inputs?.status === 'DRAFT' && isSuperUser && (
            <div className="pt-6 mt-6 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="block w-4 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  Launch
                </p>
              </div>
              <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-text-light dark:text-text-dark font-medium mb-0.5">
                    Start Auction Now
                  </p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                    Manually activate this auction and notify bidders. The cron will no longer
                    auto-start it.
                  </p>
                </div>
                <button
                  onClick={handleStartAuction}
                  disabled={starting}
                  aria-label="Start this auction manually"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {starting ? (
                    <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Zap size={11} aria-hidden="true" />
                  )}
                  {starting ? 'Starting...' : 'Start Auction'}
                </button>
              </div>
            </div>
          )}

          {inputs?.status === 'ACTIVE' && isSuperUser && (
            <div className="pt-6 mt-6 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3 mb-4">
                <span className="block w-4 h-px bg-red-500 shrink-0" aria-hidden="true" />
                <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-red-500">
                  End Auction
                </p>
              </div>
              <div className="border border-red-500/20 bg-red-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-text-light dark:text-text-dark font-medium mb-0.5">
                    End Auction Now
                  </p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">
                    Immediately ends the auction, resolves winners, and sends payment emails. This
                    cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleEndAuction}
                  disabled={ending}
                  aria-label="End auction manually"
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
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
              </div>
            </div>
          )}

          {/* Danger zone — only visible for DRAFT auctions */}
          {inputs?.status === 'DRAFT' && isSuperUser && (
            <div className="pt-6 mt-6 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="block w-4 h-px bg-red-500 dark:bg-red-400 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-red-500 dark:text-red-400">
                  Danger Zone
                </p>
              </div>
              <div className="border border-red-500/20 dark:border-red-400/20 bg-red-500/5 dark:bg-red-400/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-mono text-text-light dark:text-text-dark font-medium mb-0.5">
                    Delete Auction
                  </p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                    Permanently delete this auction and all its items. This action cannot be undone.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAuction}
                  disabled={deleting}
                  aria-label="Delete this auction permanently"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 border border-red-500/40 dark:border-red-400/40 text-red-500 dark:text-red-400 text-[10px] font-mono tracking-[0.2em] uppercase hover:bg-red-500 dark:hover:bg-red-400 hover:text-white dark:hover:text-bg-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:focus-visible:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <Loader2 size={11} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 size={11} aria-hidden="true" />
                  )}
                  {deleting ? 'Deleting...' : 'Delete Auction'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
