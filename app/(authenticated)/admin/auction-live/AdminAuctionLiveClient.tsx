'use client'

import { useEffect, useState, useRef } from 'react'
import Pusher from 'pusher-js'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Zap, AlertTriangle, Trash2, X, Users, Activity } from 'lucide-react'
import deleteBid from 'lib/actions/super-user/deleteBid'
import { IAuctionBid } from 'types/_auction-bid'
import { IAuctionItem } from 'types/_auction-item'
import { store } from 'lib/store/store'
import { showToast } from 'lib/store/slices/toastSlice'
import { formatDate } from 'app/utils/_date.utils'
import { Anomaly, ANOMALY_COLORS, ANOMALY_LABELS, LiveBidEvent } from 'lib/mock/live-auction.mock'
import { IAuction } from 'types/_auction'
import dismissAuctionAnomaly from 'lib/actions/super-user/dismissAuctionAnomoly'
import { detectAuctionAnomalies } from 'lib/actions/super-user/detectAuctionAnomalies'
import AdminPageHeader from 'app/components/admin/_shared/AdminPageHeader'

export default function AdminAuctionLiveClient({ auction }: { auction: IAuction | null }) {
  const [items, setItems] = useState<IAuctionItem[]>((auction?.items as IAuctionItem[]) ?? [])
  const [liveFeed, setLiveFeed] = useState<LiveBidEvent[]>(
    (auction?.bids ?? []).map((bid) => ({
      bidId: bid.id,
      confirmedBidAmount: Number(bid.bidAmount),
      totalBids: 0,
      topBidder: bid.bidderName ?? 'Anonymous',
      currentBid: Number(bid.bidAmount),
      minimumBid: Number(bid.bidAmount) + 1,
      status: bid.status,
      createdAt:
        bid.createdAt instanceof Date ? bid.createdAt.toISOString() : String(bid.createdAt),
      auctionItemId: bid.auctionItemId,
      userId: bid.userId,
      userEmail: bid.email ?? undefined
    }))
  )
  // Initialize from server data instead of mock
  const [anomalies, setAnomalies] = useState<Anomaly[]>(
    (auction?.anomalies ?? []).map((a) => ({
      id: a.id,
      type: a.type as Anomaly['type'],
      itemId: a.itemId,
      itemName: a.itemName,
      message: a.message,
      bids: [],
      createdAt: new Date(a.createdAt),
      dismissed: a.dismissed
    }))
  )
  const [deletingBidId, setDeletingBidId] = useState<string | null>(null)
  const userBidTimestamps = useRef<Record<string, Date[]>>({})
  const feedRef = useRef<HTMLDivElement>(null)

  // ── Pusher subscriptions ───────────────────────────────────────────────────
  useEffect(() => {
    if (!auction) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
    })

    const channels = auction.items.map((item) => {
      const channel = pusher.subscribe(`auction-item-${item.id}`)

      channel.bind('bid-placed', async (data: { bid: any; auctionItem: any }) => {
        const event: LiveBidEvent = {
          bidId: data.bid.id,
          confirmedBidAmount: Number(data.bid.bidAmount),
          totalBids: data.auctionItem.totalBids,
          topBidder: data.auctionItem.topBidder,
          currentBid: Number(data.auctionItem.currentBid),
          minimumBid: Number(data.auctionItem.minimumBid),
          status: data.bid.status,
          createdAt: data.bid.createdAt,
          auctionItemId: item.id,
          userId: data.bid.userId,
          userEmail: data.bid.email
        }

        const newBid = {
          id: data.bid.id,
          auctionItemId: item.id,
          bidAmount: Number(data.bid.bidAmount),
          bidderName: data.bid.bidderName,
          status: data.bid.status,
          createdAt: new Date(data.bid.createdAt),
          user: { id: data.bid.userId ?? '', email: data.bid.email ?? '' }
        } as unknown as IAuctionBid

        setLiveFeed((prev) => [event, ...prev].slice(0, 200))

        setItems((prev) =>
          prev.map((i) => {
            if (i.id !== item.id) return i
            return {
              ...i,
              currentBid: Number(data.auctionItem.currentBid),
              currentPrice: Number(data.auctionItem.currentBid),
              topBidder: data.auctionItem.topBidder,
              totalBids: data.auctionItem.totalBids,
              bids: [newBid, ...i.bids]
            } as unknown as IAuctionItem
          })
        )

        // Run anomaly detection against the latest items snapshot
        const updatedItems = items.map((i) => {
          if (i.id !== item.id) return i
          return {
            ...i,
            currentBid: Number(data.auctionItem.currentBid),
            bids: [newBid, ...i.bids]
          } as unknown as IAuctionItem
        })

        const newAnomalies = await detectAuctionAnomalies({
          event,
          updatedItems,
          auctionId: auction.id,
          userBidTimestamps
        })

        if (newAnomalies.length > 0) setAnomalies((prev) => [...newAnomalies, ...prev])

        feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      })

      return channel
    })

    return () => {
      channels.forEach((c) => c.unbind_all())
      pusher.disconnect()
    }
  }, [auction, items])

  // ── Delete bid ─────────────────────────────────────────────────────────────
  const handleDeleteBid = async (bidId: string, itemId: string) => {
    setDeletingBidId(bidId)
    const result = await deleteBid(bidId)
    setDeletingBidId(null)

    if (!result.success) {
      store.dispatch(showToast({ type: 'error', message: 'Failed to delete bid' }))
      return
    }

    // Remove from local state
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item
        const remaining = item.bids.filter((b) => b.id !== bidId)
        const newTop = remaining[0] ?? null
        return {
          ...item,
          bids: remaining,
          totalBids: Math.max(0, item.totalBids - 1),
          currentBid: newTop?.bidAmount ?? item.startingPrice,
          topBidder: newTop?.bidderName ?? null
        }
      })
    )

    setLiveFeed((prev) => prev.filter((e) => e.bidId !== bidId))
    store.dispatch(showToast({ type: 'success', message: 'Bid deleted!' }))
  }

  const handleDismissAnomaly = async (id: string) => {
    setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)))
    await dismissAuctionAnomaly(id)
  }

  const activeAnomalies = anomalies.filter((a) => !a.dismissed)
  const totalBids = items.reduce((sum, i) => sum + i.totalBids, 0)
  const activeBidders = auction?.bidders?.length ?? 0

  if (!auction) {
    return (
      <div className="max-w-6xl mx-auto px-4 xs:px-5 sm:px-6 py-16 text-center">
        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
          No active auction
        </p>
      </div>
    )
  }

  return (
    <>
      <AdminPageHeader
        title={
          auction
            ? `${auction.title} — ends ${formatDate(auction.endDate, true)}`
            : 'Live auction monitoring and anomaly detection'
        }
      />
      <div className="max-w-screen-2xl mx-auto px-4 xs:px-5 sm:px-6 py-6 space-y-6">
        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
          {[
            { label: 'Total Bids', value: totalBids, icon: Gavel },
            { label: 'Active Bidders', value: activeBidders, icon: Users },
            { label: 'Items', value: items.length, icon: Activity },
            {
              label: 'Anomalies',
              value: activeAnomalies.length,
              icon: AlertTriangle,
              alert: activeAnomalies.length > 0
            }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-bg-light dark:bg-bg-dark px-5 py-4 flex items-center gap-3"
            >
              <stat.icon
                size={16}
                className={
                  stat.alert
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-muted-light dark:text-muted-dark'
                }
                aria-hidden="true"
              />
              <div>
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                  {stat.label}
                </p>
                <p
                  className={`font-quicksand font-black text-2xl leading-none ${stat.alert ? 'text-red-500 dark:text-red-400' : 'text-text-light dark:text-text-dark'}`}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Anomaly alerts ── */}
        <AnimatePresence>
          {activeAnomalies.map((anomaly) => (
            <motion.div
              key={anomaly.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border border-red-500/40 dark:border-red-400/40 bg-red-500/5 dark:bg-red-400/5 px-5 py-4"
              role="alert"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <AlertTriangle
                    size={14}
                    className="text-red-500 dark:text-red-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p
                        className={`text-[10px] font-mono tracking-[0.2em] uppercase ${ANOMALY_COLORS[anomaly.type]}`}
                      >
                        {ANOMALY_LABELS[anomaly.type]}
                      </p>
                      <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                        —
                      </span>
                      <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-light dark:text-text-dark font-bold">
                        {anomaly.itemName}
                      </p>
                    </div>
                    <p className="text-xs font-mono text-text-light dark:text-text-dark">
                      {anomaly.message}
                    </p>

                    {/* Affected bids */}
                    {anomaly.bids.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {anomaly.bids.map((bid) => (
                          <div
                            key={bid.id}
                            className="flex items-center gap-3 text-[10px] font-mono text-muted-light dark:text-muted-dark"
                          >
                            <span>${bid.bidAmount}</span>
                            <span className="opacity-50">—</span>
                            <span>{bid.bidderName ?? 'Unknown'}</span>
                            <span className="opacity-50">—</span>
                            <span>{formatDate(new Date(bid.createdAt), true)}</span>
                            <button
                              onClick={() => handleDeleteBid(bid.id, anomaly.itemId)}
                              disabled={deletingBidId === bid.id}
                              aria-label={`Delete bid of $${bid.bidAmount} by ${bid.bidderName}`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 border border-red-500/40 text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40"
                            >
                              <Trash2 size={9} aria-hidden="true" />
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDismissAnomaly(anomaly.id)}
                  aria-label="Dismiss anomaly"
                  className="text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 1200:grid-cols-[380px_1fr] gap-6">
          {/* ── Live feed — left, prominent ── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full  bg-primary-light dark:bg-primary-dark opacity-75" />
                <span className="relative inline-flex  h-2 w-2 bg-primary-light dark:bg-primary-dark" />
              </span>
              <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                Live Feed ({liveFeed.length})
              </p>
            </div>

            <div
              ref={feedRef}
              className="border border-border-light dark:border-border-dark overflow-y-auto"
              style={{ height: 'calc(100vh - 280px)' }}
              aria-label="Live bid feed"
              aria-live="polite"
              aria-atomic="false"
            >
              {liveFeed.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                    Waiting for bids...
                  </p>
                </div>
              ) : (
                <ul role="list">
                  <AnimatePresence mode="popLayout">
                    {liveFeed.map((event, i) => {
                      const item = items.find((it) => it.id === event.auctionItemId)
                      return (
                        <motion.li
                          key={`${event.auctionItemId}-${event.createdAt}-${i}`}
                          initial={{ opacity: 0, x: -16, backgroundColor: 'rgba(8,145,178,0.15)' }}
                          animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(8,145,178,0)' }}
                          transition={{ duration: 0.4 }}
                          className={`flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border-light dark:border-border-dark last:border-b-0 ${
                            i % 2 === 0 ? 'bg-transparent' : 'bg-surface-light dark:bg-surface-dark'
                          }`}
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-bold text-primary-light dark:text-primary-dark tabular-nums">
                                ${event.confirmedBidAmount.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">
                                {event.topBidder}
                              </span>
                            </div>
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">
                              {item?.name ?? event.auctionItemId}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark shrink-0 tabular-nums">
                            {formatDate(new Date(event.createdAt), true)}
                          </span>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </div>

          {/* ── Items grid — right ── */}
          <div className="space-y-3">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Items ({items.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
              {items.map((item) => {
                const itemAnomalies = activeAnomalies.filter((a) => a.itemId === item.id)
                const hasInstantBuyers = item.instantBuyers.length > 0

                return (
                  <div
                    key={item.id}
                    className={`bg-bg-light dark:bg-bg-dark p-5 space-y-3 ${
                      itemAnomalies.length > 0
                        ? 'border-l-4 border-red-500 dark:border-red-400'
                        : ''
                    }`}
                  >
                    {/* Item header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-0.5">
                          {item.sellingFormat}
                        </p>
                        <p className="text-sm font-mono font-medium text-text-light dark:text-text-dark truncate">
                          {item.name}
                        </p>
                      </div>
                      {itemAnomalies.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/30 shrink-0">
                          <AlertTriangle
                            size={11}
                            className="text-red-500 dark:text-red-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-red-500 dark:text-red-400">
                            {itemAnomalies.length}{' '}
                            {itemAnomalies.length === 1 ? 'anomaly' : 'anomalies'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Item stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                          Current
                        </p>
                        <p className="text-sm font-mono font-bold text-primary-light dark:text-primary-dark tabular-nums">
                          ${(item.currentBid ?? item.startingPrice ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                          Bids
                        </p>
                        <p className="text-sm font-mono font-bold text-text-light dark:text-text-dark">
                          {item.totalBids}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                          Top
                        </p>
                        <p className="text-xs font-mono text-text-light dark:text-text-dark truncate">
                          {item.topBidder ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Recent bids */}
                    {item.bids.length > 0 && (
                      <div className="space-y-1 border-t border-border-light dark:border-border-dark pt-3">
                        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2">
                          Recent Bids
                        </p>
                        {item.bids.slice(0, 5).map((bid) => {
                          const isDuplicate =
                            item.bids.filter((b) => Number(b.bidAmount) === Number(bid.bidAmount))
                              .length > 1
                          return (
                            <div
                              key={bid.id}
                              className={`flex items-center justify-between gap-2 px-2 py-1.5 ${
                                isDuplicate
                                  ? 'bg-red-500/10 border border-red-500/20'
                                  : 'bg-surface-light dark:bg-surface-dark'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 text-[10px] font-mono">
                                {isDuplicate && (
                                  <AlertTriangle
                                    size={9}
                                    className="text-red-500 dark:text-red-400 shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="text-primary-light dark:text-primary-dark font-bold tabular-nums">
                                  ${Number(bid.bidAmount).toLocaleString()}
                                </span>
                                <span className="text-muted-light dark:text-muted-dark truncate">
                                  {bid.bidderName ?? '—'}
                                </span>
                                <span className="text-muted-light dark:text-muted-dark opacity-60 shrink-0 tabular-nums">
                                  {formatDate(new Date(bid.createdAt), true)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteBid(bid.id, item.id)}
                                disabled={deletingBidId === bid.id}
                                aria-label={`Delete bid of $${Number(bid.bidAmount)} by ${bid.bidderName}`}
                                className="shrink-0 text-muted-light dark:text-muted-dark hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-30"
                              >
                                <Trash2 size={11} aria-hidden="true" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Instant buyers — only shown if they exist */}
                    {hasInstantBuyers && (
                      <div className="border-t border-border-light dark:border-border-dark pt-3">
                        <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2">
                          Instant Buyers ({item.instantBuyers.length}
                          {item.totalQuantity ? `/${item.totalQuantity}` : ''})
                        </p>
                        {item.instantBuyers.map((buyer) => (
                          <div
                            key={buyer.id}
                            className="flex items-center gap-2 text-[10px] font-mono text-muted-light dark:text-muted-dark py-1"
                          >
                            <Zap size={9} className="text-yellow-500 shrink-0" aria-hidden="true" />
                            <span className="truncate">{buyer.name ?? buyer.email ?? '—'}</span>
                            {buyer.totalPrice && (
                              <span className="text-primary-light dark:text-primary-dark tabular-nums ml-auto shrink-0">
                                ${Number(buyer.totalPrice).toLocaleString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
