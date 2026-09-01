import { CheckCircle, ChevronRight, CreditCard, Gavel, Receipt, Zap } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from './EmptyState'
import { StatusPill } from 'app/components/_primitives/StatusPill'
import { formatDate } from 'app/utils/_date.utils'
import Picture from 'app/components/_common/Picture'
import { formatMoney } from 'app/utils/_currency.utils'
import { AuctionParticipation, AuctionPurchase } from 'types/_my-pack.types'

interface Props {
  auctionParticipation: AuctionParticipation[]
  auctionPurchases: AuctionPurchase[]
}

function ItemImage({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="w-14 h-14 shrink-0 overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
      {src ? (
        <Picture priority={false} src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[9px] font-mono text-muted-light dark:text-muted-dark">?</span>
        </div>
      )}
    </div>
  )
}

export function Auctions({ auctionParticipation, auctionPurchases }: Props) {
  const hasAny = auctionParticipation?.length > 0 || auctionPurchases?.length > 0

  // build a map of auctionId → participation data
  const participationMap = new Map((auctionParticipation ?? []).map((a) => [a.auctionId, a]))

  // purchases that have no matching participation (bought without bidding)
  const orphanPurchases = (auctionPurchases ?? []).filter((p) => !participationMap.has(p.auctionId))

  return (
    <section aria-labelledby="auctions-heading">
      {!hasAny ? (
        <EmptyState message="You haven't participated in any auctions yet." />
      ) : (
        <div className="space-y-4">
          {/* ── Auctions with participation (bids + possible instant buys) ── */}
          {auctionParticipation?.map((auction) => {
            const relatedPurchases = (auctionPurchases ?? []).filter((p) => p.auctionId === auction.auctionId)

            return (
              <div key={auction.auctionId} className="border border-border-light dark:border-border-dark">
                {/* Auction header */}
                <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="block w-3 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
                      <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
                        {auction.auctionTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={auction.auctionStatus} />
                      {auction.auctionEndDate && (
                        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                          {auction.auctionStatus === 'active' ? 'Ends' : 'Ended'} {formatDate(auction.auctionEndDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  {auction.paymentLink && (
                    <div className="mt-2 pt-2 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-3">
                      {auction.paymentStatus === 'PAID' ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-green-500 shrink-0" aria-hidden="true" />
                          <p className="text-[10px] font-mono tracking-widest uppercase text-green-500">
                            Payment Complete
                          </p>
                          {auction.paidOn && (
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                              · {formatDate(auction.paidOn, true)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                          Payment required to claim your items
                        </p>
                      )}
                      <Link
                        href={auction.paymentLink}
                        className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                          auction.paymentStatus === 'PAID'
                            ? 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark'
                            : 'border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10'
                        }`}
                      >
                        {auction.paymentStatus === 'PAID' ? (
                          <>
                            <Receipt className="w-3 h-3 shrink-0" aria-hidden="true" /> View Receipt
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3 h-3 shrink-0" aria-hidden="true" /> Complete Payment
                          </>
                        )}
                      </Link>
                    </div>
                  )}
                </div>

                {/* Bid items */}
                {auction.items.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-surface-light/50 dark:bg-surface-dark/50 border-b border-border-light dark:border-border-dark">
                      <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark flex items-center gap-1.5">
                        <Gavel size={9} aria-hidden="true" /> Bids
                      </p>
                    </div>
                    <ul
                      className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark"
                      role="list"
                    >
                      {auction.items.map((item) => (
                        <li key={item.auctionItemId} className="bg-bg-light dark:bg-bg-dark flex gap-4 p-4 sm:p-5">
                          <ItemImage src={item.itemImage} alt={item.itemName} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                              <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug">
                                {item.itemName}
                              </p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.isWinner && (
                                  <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark">
                                    Won
                                  </span>
                                )}
                                {item.status === 'TOP_BID' && !item.isWinner && (
                                  <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-green-500/10 text-green-500 dark:text-green-400">
                                    Top Bid
                                  </span>
                                )}
                                {item.status === 'OUTBID' && !item.isWinner && (
                                  <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-red-500/10 text-red-500 dark:text-red-400">
                                    Outbid
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">
                              {formatMoney(item.myHighestBid)}
                              <span className="text-[10px] font-mono font-normal text-muted-light dark:text-muted-dark ml-1">
                                your bid
                              </span>
                            </p>
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                              {item.itemTotalBids} total bid{item.itemTotalBids !== 1 ? 's' : ''} on this item
                              {item.myBidCount > 1 && ` · ${item.myBidCount} yours`}
                            </p>
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                              Last bid {formatDate(item.lastBidAt, true)}
                            </p>
                            <Link
                              href={`/auctions/${auction.customAuctionLink}/${item.auctionItemId}`}
                              className="group inline-flex items-center gap-1.5 mt-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                              aria-label={`View ${item.itemName}`}
                            >
                              View Item
                              <ChevronRight
                                size={10}
                                className="group-hover:translate-x-0.5 transition-transform"
                                aria-hidden="true"
                              />
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Instant buy items under same auction */}
                {relatedPurchases.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-surface-light/50 dark:bg-surface-dark/50 border-t border-b border-border-light dark:border-border-dark">
                      <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark flex items-center gap-1.5">
                        <Zap size={9} aria-hidden="true" /> Instant Buys
                      </p>
                    </div>
                    <ul
                      className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark"
                      role="list"
                    >
                      {relatedPurchases.map((purchase) =>
                        purchase.items.map((item) => (
                          <li key={item.id} className="bg-bg-light dark:bg-bg-dark flex gap-4 p-4 sm:p-5">
                            <ItemImage src={item.image} alt={item.name} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug">
                                  {item.name}
                                </p>
                                <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shrink-0">
                                  Purchased
                                </span>
                              </div>
                              <p className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">
                                {formatMoney(purchase.totalAmount)}
                              </p>
                              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                                {formatDate(purchase.createdAt, true)}
                              </p>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </>
                )}
              </div>
            )
          })}

          {/* ── Orphan instant buys (no bids in same auction) ── */}
          {orphanPurchases.length > 0 && (
            <div className="border border-border-light dark:border-border-dark">
              <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center gap-2">
                <Zap size={11} className="text-primary-light dark:text-primary-dark shrink-0" aria-hidden="true" />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
                  Instant Buy Purchases
                </p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark" role="list">
                {orphanPurchases.map((purchase) => (
                  <li key={purchase.id} className="bg-bg-light dark:bg-bg-dark flex gap-4 p-4 sm:p-5">
                    <ItemImage src={purchase.items[0].image} alt={purchase.items[0].name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-quicksand font-black text-sm text-text-light dark:text-text-dark leading-snug">
                          {purchase.items[0].name}
                        </p>
                        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 shrink-0">
                          Purchased
                        </span>
                      </div>
                      <p className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">
                        {formatMoney(purchase.totalAmount)}
                      </p>
                      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                        {formatDate(purchase.createdAt, true)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
