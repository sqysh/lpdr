'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Zap, DollarSign, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { placeBid } from 'lib/actions/user/auction/placeBid'
import { useEscapeKey } from 'lib/hooks/useEscapeKey.hook'
import { useRouter } from 'next/navigation'
import { pusherClient } from 'lib/pusher/pusher-client'
import { IAuctionItem } from 'types/auction.types'
import { useSounds } from 'lib/hooks/useSounds.hook'
import { useAuctionUiStore } from 'stores/auction-ui.store'
import { useConfettiStore } from 'stores/confetti.store'

export function AuctionBidModal({ auctionItem }: { auctionItem: IAuctionItem }) {
  const isOpen = useAuctionUiStore((s) => s.bidModalOpen)
  const closeBidModal = useAuctionUiStore((s) => s.closeBidModal)
  const showConfetti = useConfettiStore((s) => s.show)

  const router = useRouter()
  const [placedBidAmount, setPlacedBidAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [isQuickBidding, setIsQuickBidding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'default' | 'custom' | 'success'>('default')
  const [currentBid, setCurrentBid] = useState(Number(auctionItem?.currentBid ?? 0))
  const [minimumBid, setMinimumBid] = useState(Number(auctionItem?.minimumBid ?? auctionItem?.startingPrice ?? 0))
  const [raceCondition, setRaceCondition] = useState<{
    newMinimumBid: number
    currentBid: number | null
  } | null>(null)

  const { play: playQuickBid } = useSounds()
  const { play: playCustomBid } = useSounds()

  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const quickBidAmount = minimumBid + 10
  const itemName = auctionItem?.name ?? 'Item'

  const onClose = () => {
    closeBidModal()
    setCustomAmount('')
    setError(null)
    setMode('default')
  }

  useEffect(() => {
    if (mode === 'custom') {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [mode])

  useEscapeKey(isOpen, onClose)

  useEffect(() => {
    if (!isOpen || !auctionItem?.id) return

    const channel = pusherClient.subscribe(`auction-item-${auctionItem.id}`)

    channel.bind('bid-placed', (data: { auctionItem: any }) => {
      setCurrentBid(data.auctionItem.currentBid)
      setMinimumBid(data.auctionItem.minimumBid)
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(`auction-item-${auctionItem.id}`)
    }
  }, [isOpen, auctionItem?.id])

  const handleQuickBid = async () => {
    setError(null)
    setRaceCondition(null)
    setIsQuickBidding(true)

    const result = await placeBid(auctionItem.id, quickBidAmount)

    setIsQuickBidding(false)
    playQuickBid('se1')

    if (!result.success) {
      if (result.error === 'LOCK_NOT_ACQUIRED' && result.data?.newMinimumBid) {
        setRaceCondition({
          newMinimumBid: result.data.newMinimumBid,
          currentBid: result.data.currentBid
        })
        return
      }
      setError(result.error ?? 'Unable to place bid. Please try again.')
      return
    }

    router.refresh()
    showConfetti()
    setPlacedBidAmount(quickBidAmount)
    setMode('success')
  }

  const handleCustomBid = async () => {
    const amount = parseInt(customAmount, 10)
    if (!customAmount || isNaN(amount)) {
      setError('Please enter a valid bid amount.')
      return
    }
    if (amount < minimumBid) {
      setError(`Minimum bid is $${minimumBid.toLocaleString()}.`)
      return
    }

    setError(null)
    setRaceCondition(null)
    setIsPlacingBid(true)

    const result = await placeBid(auctionItem.id, amount)

    setIsPlacingBid(false)
    playCustomBid('se1')

    if (!result.success) {
      if (result.error === 'LOCK_NOT_ACQUIRED' && result.data?.newMinimumBid) {
        setRaceCondition({
          newMinimumBid: result.data.newMinimumBid,
          currentBid: result.data.currentBid
        })
        return
      }
      setError(result.error ?? 'Unable to place bid. Please try again.')
      return
    }

    router.refresh()
    showConfetti()
    setPlacedBidAmount(amount)
    setMode('success')
  }

  const handleBidAgain = () => {
    setCustomAmount('')
    setError(null)
    setPlacedBidAmount(null)
    setMode('default')
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bid-modal-title"
      aria-describedby="bid-modal-desc"
      className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70"
    >
      <div
        className="relative w-full sm:max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-bg-dark border border-zinc-200 dark:border-border-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Corner tick marks ── */}
        <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none z-10" aria-hidden="true">
          <div className="absolute top-0 left-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
          <div className="absolute top-0 left-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
        </div>
        <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none z-10" aria-hidden="true">
          <div className="absolute top-0 right-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
          <div className="absolute top-0 right-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
        </div>
        <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none z-10" aria-hidden="true">
          <div className="absolute bottom-0 left-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
          <div className="absolute bottom-0 left-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
        </div>
        <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none z-10" aria-hidden="true">
          <div className="absolute bottom-0 right-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
          <div className="absolute bottom-0 right-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
        </div>

        {/* ── Top accent bar — animates in dark mode ── */}
        <div className="relative h-0.5 w-full overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-cyan-600 dark:hidden" />
          <div className="absolute inset-0 hidden dark:block bg-linear-to-r from-violet-500 via-pink-400 to-violet-500 bg-size-[200%_100%] animate-[gradient-x_3s_ease_infinite]" />
        </div>

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 430:p-6 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
              <span className="  text-f10 uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400">
                {mode === 'success' ? 'Bid Placed' : 'Place a Bid'}
              </span>
            </div>
            <h2 id="bid-modal-title" className="  text-xl 430:text-2xl uppercase leading-none text-zinc-950 dark:text-text-dark">
              {itemName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bid modal"
            className="shrink-0 p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-muted-dark/50 dark:hover:text-text-dark dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Live bid display ── */}
        <div className="mx-5 430:mx-6 mb-5 border-l-2 border-cyan-600 dark:border-violet-400 pl-4">
          <div className="flex items-center gap-2 mb-1">
            {currentBid > 0 && (
              <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full  bg-cyan-500 dark:bg-violet-400 opacity-75" />
                <span className="relative inline-flex  h-2 w-2 bg-cyan-600 dark:bg-violet-400" />
              </span>
            )}
            <p id="bid-modal-desc" className="  text-f10 uppercase tracking-[0.2em] text-zinc-500 dark:text-muted-dark">
              {currentBid > 0 ? 'Live Bid' : 'Starting Bid'}
            </p>
          </div>
          <p className="  text-3xl tabular-nums tracking-tight text-zinc-950 dark:text-text-dark">
            ${(currentBid || minimumBid).toLocaleString()}
          </p>
          {currentBid > 0 && (
            <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark mt-0.5">
              Minimum next bid:{' '}
              <span className="tabular-nums text-zinc-950 dark:text-text-dark">${minimumBid.toLocaleString()}</span>
            </p>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="h-px mx-5 430:mx-6 mb-5 bg-zinc-200 dark:bg-border-dark" aria-hidden="true" />

        {/* ── Mode tabs — hidden in success mode ── */}
        {mode !== 'success' && (
          <div className="flex border-b border-zinc-200 dark:border-border-dark mx-5 430:mx-6 mb-5" role="tablist">
            {(['default', 'custom'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                onClick={() => {
                  setMode(tab)
                  setError(null)
                }}
                className={`  text-f10 uppercase tracking-[0.2em] pb-3 pr-6 transition-colors focus-visible:outline-none
                  ${
                    mode === tab
                      ? 'border-b-2 border-cyan-600 dark:border-violet-400 text-cyan-600 dark:text-violet-400'
                      : 'text-zinc-400 hover:text-zinc-600 dark:text-muted-dark/50 dark:hover:text-muted-dark'
                  }`}
              >
                {tab === 'default' ? 'Quick Options' : 'Custom Amount'}
              </button>
            ))}
          </div>
        )}

        {/* ── Panels ── */}
        <div className="px-5 430:px-6 pb-6">
          {raceCondition ? (
            <div className="space-y-4">
              <div className="border-l-2 border-yellow-500 dark:border-yellow-400 pl-4">
                <p className="  text-f10 uppercase tracking-[0.2em] text-yellow-500 dark:text-yellow-400 mb-1">
                  Someone beat you by a second
                </p>
                <p className="font-lato text-sm text-zinc-500 dark:text-muted-dark leading-relaxed">
                  Another bid just went through. The new minimum bid is{' '}
                  <strong className="text-zinc-950 dark:text-text-dark">${raceCondition.newMinimumBid.toLocaleString()}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMinimumBid(raceCondition.newMinimumBid)
                  setCurrentBid(raceCondition.currentBid ?? raceCondition.newMinimumBid)
                  setRaceCondition(null)
                  setMode('default')
                }}
                className="group relative w-full overflow-hidden flex items-center justify-between px-5 py-4 border border-cyan-600/20 hover:border-cyan-600/50 bg-cyan-600/10 hover:bg-cyan-600/15 text-cyan-700 dark:border-violet-400/20 dark:hover:border-violet-400/50 dark:bg-violet-400/10 dark:hover:bg-violet-400/15 dark:text-violet-400 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400 hover:[box-shadow:0_0_20px_2px_rgba(8,145,178,0.12)] dark:hover:[box-shadow:0_0_20px_2px_rgba(167,139,250,0.18)]"
              >
                <span
                  className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.2s_ease_infinite] pointer-events-none"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <div className="text-left">
                    <p className="  text-sm uppercase tracking-wide leading-none mb-0.5">
                      Bid ${raceCondition.newMinimumBid.toLocaleString()}
                    </p>
                    <p className="font-lato text-xs text-cyan-600/60 dark:text-violet-400/60">New minimum bid</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRaceCondition(null)}
                className="w-full px-6 py-3   text-f10 uppercase tracking-widest border border-zinc-200 hover:border-cyan-600/30 hover:bg-zinc-50 dark:border-border-dark dark:hover:border-violet-400/30 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {/* Quick Options */}
              {mode === 'default' && (
                <div role="tabpanel" aria-label="Quick bid options">
                  {/* Instant Bid — shimmer + outer glow on hover */}
                  <button
                    type="button"
                    onClick={handleQuickBid}
                    disabled={isQuickBidding || isPlacingBid}
                    aria-label={`Instant bid $${quickBidAmount.toLocaleString()}`}
                    className="group relative w-full overflow-hidden flex items-center justify-between px-5 py-4 mb-3 border border-cyan-600/20 hover:border-cyan-600/50 bg-cyan-600/10 hover:bg-cyan-600/15 text-cyan-700 dark:border-violet-400/20 dark:hover:border-violet-400/50 dark:bg-violet-400/10 dark:hover:bg-violet-400/15 dark:text-violet-400 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400 disabled:opacity-50 disabled:cursor-not-allowed [box-shadow:none] hover:[box-shadow:0_0_20px_2px_rgba(8,145,178,0.12)] dark:hover:[box-shadow:0_0_20px_2px_rgba(167,139,250,0.18)]"
                  >
                    {/* Shimmer sweep on hover */}
                    <span
                      className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.2s_ease_infinite] pointer-events-none"
                      aria-hidden="true"
                    />
                    <div className="flex items-center gap-3">
                      <Zap
                        className="w-4 h-4 shrink-0 group-hover:animate-[ticker-flash_0.7s_ease-in-out_infinite]"
                        aria-hidden="true"
                      />
                      <div className="text-left">
                        <p className="  text-sm uppercase tracking-wide leading-none mb-0.5">Instant Bid</p>
                        <p className="font-lato text-xs text-cyan-600/60 dark:text-violet-400/60">+$10 above minimum</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isQuickBidding ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <span className="  text-lg tabular-nums">${quickBidAmount.toLocaleString()}</span>
                      )}
                    </div>
                  </button>

                  {/* Custom amount switcher */}
                  <button
                    type="button"
                    onClick={() => setMode('custom')}
                    className="w-full flex items-center justify-between px-5 py-4 border border-zinc-200 hover:border-cyan-600/30 hover:bg-zinc-50 dark:border-border-dark dark:hover:border-violet-400/30 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <div className="text-left">
                        <p className="  text-sm uppercase tracking-wide leading-none mb-0.5 text-zinc-950 dark:text-text-dark">
                          Custom Amount
                        </p>
                        <p className="font-lato text-xs text-zinc-400 dark:text-muted-dark/50">Bid any amount above minimum</p>
                      </div>
                    </div>
                    <DollarSign className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Custom Amount */}
              {mode === 'custom' && (
                <div role="tabpanel" aria-label="Custom bid amount">
                  <label
                    htmlFor="bid-amount"
                    className="block   text-f10 uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark mb-2"
                  >
                    Bid Amount
                  </label>
                  <div className="relative mb-1">
                    <span
                      className="absolute left-4 top-1/2 -translate-y-1/2   text-sm text-zinc-500 dark:text-muted-dark"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <input
                      ref={inputRef}
                      id="bid-amount"
                      type="text"
                      inputMode="numeric"
                      min={minimumBid}
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value.replace(/[^0-9]/g, ''))
                        setError(null)
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomBid()}
                      placeholder={minimumBid.toString()}
                      aria-describedby={error ? 'bid-error' : 'bid-hint'}
                      aria-invalid={!!error}
                      className="w-full pl-8 pr-4 py-4 border-l-2 border-t border-r border-b border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-[#13131f] focus:shadow-[0_0_0_1px_rgba(8,145,178,0.3)] dark:focus:shadow-[0_0_0_1px_rgba(167,139,250,0.3)] text-zinc-950 dark:text-text-dark placeholder:text-zinc-400 dark:placeholder:text-muted-dark/40   text-lg tabular-nums outline-none transition-all"
                    />
                  </div>
                  <p id="bid-hint" className="font-lato text-xs text-zinc-500 dark:text-muted-dark mb-5">
                    Minimum bid: <span className="tabular-nums">${minimumBid.toLocaleString()}</span>
                  </p>

                  <button
                    type="button"
                    onClick={handleCustomBid}
                    disabled={isPlacingBid || isQuickBidding || !customAmount || Number(customAmount) < minimumBid}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4   text-sm uppercase tracking-widest text-white bg-cyan-600 hover:bg-cyan-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:bg-cyan-600/30 dark:disabled:bg-violet-500/30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-bg-dark"
                  >
                    {isPlacingBid ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Placing Bid...</span>
                        <span className="sr-only">Please wait</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4" aria-hidden="true" />
                        <span>
                          {customAmount && !isNaN(parseFloat(customAmount))
                            ? `Place $${parseFloat(customAmount).toLocaleString()} Bid`
                            : 'Place Bid'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Success */}
              {mode === 'success' && (
                <div role="status" aria-live="polite" aria-label="Bid placed successfully">
                  {/* Confirmed amount */}
                  <div className="border-l-2 border-cyan-600 dark:border-violet-400 pl-4 mb-5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-violet-400 shrink-0" aria-hidden="true" />
                      <p className="  text-f10 uppercase tracking-[0.2em] text-cyan-600 dark:text-violet-400">Bid Confirmed</p>
                    </div>
                    <p className="  text-3xl tabular-nums tracking-tight text-zinc-950 dark:text-text-dark">
                      ${placedBidAmount?.toLocaleString()}
                    </p>
                    <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark mt-0.5">
                      You are currently the top bidder
                    </p>
                  </div>

                  {/* Live minimum — updates via Pusher */}
                  <div className="px-4 py-3 mb-5 bg-zinc-50 dark:bg-white/3 border border-zinc-200 dark:border-border-dark">
                    <p className="  text-f10 uppercase tracking-[0.2em] text-zinc-500 dark:text-muted-dark mb-1">
                      Next minimum bid
                    </p>
                    <p className="  text-xl tabular-nums text-zinc-950 dark:text-text-dark">
                      ${Number(minimumBid).toLocaleString()}
                    </p>
                    <p className="font-lato text-xs text-zinc-400 dark:text-muted-dark/50 mt-0.5">Updates in real time</p>
                  </div>

                  {/* Bid again */}
                  <button
                    type="button"
                    onClick={handleBidAgain}
                    className="group relative w-full overflow-hidden flex items-center justify-between px-5 py-4 mb-3 border border-cyan-600/20 hover:border-cyan-600/50 bg-cyan-600/10 hover:bg-cyan-600/15 text-cyan-700 dark:border-violet-400/20 dark:hover:border-violet-400/50 dark:bg-violet-400/10 dark:hover:bg-violet-400/15 dark:text-violet-400 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400 hover:[box-shadow:0_0_20px_2px_rgba(8,145,178,0.12)] dark:hover:[box-shadow:0_0_20px_2px_rgba(167,139,250,0.18)]"
                  >
                    <span
                      className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.2s_ease_infinite] pointer-events-none"
                      aria-hidden="true"
                    />
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <div className="text-left">
                        <p className="  text-sm uppercase tracking-wide leading-none mb-0.5">Bid Again</p>
                        <p className="font-lato text-xs text-cyan-600/60 dark:text-violet-400/60">Place a higher bid</p>
                      </div>
                    </div>
                  </button>

                  {/* Done */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full px-6 py-3   text-f10 uppercase tracking-widest border border-zinc-200 hover:border-cyan-600/30 hover:bg-zinc-50 dark:border-border-dark dark:hover:border-violet-400/30 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
                  >
                    Done
                  </button>
                </div>
              )}
              {/* Error — hidden in success mode */}
              {error && mode !== 'success' && (
                <div
                  id="bid-error"
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-3 px-4 py-3 mt-4 border-l-2 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-400/5 text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="font-lato text-xs leading-relaxed">{error}</p>
                </div>
              )}

              {/* Cancel — hidden in success mode */}
              {mode !== 'success' && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-3 px-6 py-3   text-f10 uppercase tracking-widest border border-zinc-200 hover:border-cyan-600/30 hover:bg-zinc-50 dark:border-border-dark dark:hover:border-violet-400/30 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
                >
                  Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
