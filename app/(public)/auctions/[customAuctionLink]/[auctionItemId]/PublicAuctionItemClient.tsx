'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, Gavel } from 'lucide-react'
import { useCountdown } from 'lib/hooks/useCountdown.hook'
import { store } from 'lib/store/store'
import { setOpenAuctionBidModal } from 'lib/store/slices/uiSlice'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StickyBar } from 'app/(public)/auctions/[customAuctionLink]/[auctionItemId]/_components/StickyBar'
import { TitleBlock } from 'app/(public)/auctions/[customAuctionLink]/[auctionItemId]/_components/TitleBlock'
import { FixedFooterNav } from 'app/(public)/auctions/[customAuctionLink]/[auctionItemId]/_components/FixedFooterNav'
import { PriceBlock } from 'app/(public)/auctions/[customAuctionLink]/[auctionItemId]/_components/PriceBlock'
import { ItemDetails } from 'app/(public)/auctions/[customAuctionLink]/[auctionItemId]/_components/ItemDetails'
import { AuctionBidModal } from 'app/(public)/auctions/[customAuctionLink]/[auctionItemId]/_components/AuctionBidModal'
import { CountUnit } from 'app/components/_primitives'
import { AuctionItemPhotoGallery } from './_components/AuctionItemPhotoGallery'
import { BidHistory } from './_components/BidHistory'

export default function PublicAuctionItemClient({ item, auctionItems }) {
  const session = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isAuthed = session.status === 'authenticated'
  const { days, hours, minutes, seconds, done } = useCountdown(new Date(item?.auction?.endDate))
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })

  const isActive = item?.auction?.status === 'ACTIVE'
  const isEnded = item?.auction?.status === 'ENDED'
  const isSold = item?.status === 'SOLD'
  const isFixed = item?.sellingFormat === 'FIXED'
  const customAuctionLink = item?.auction?.customAuctionLink

  const topBid = item?.bids[0]

  useEffect(() => {
    if (searchParams.get('bidModal') === 'true' && session?.data?.user) {
      store.dispatch(setOpenAuctionBidModal(item))
      // clear the param from the URL so it doesn't persist on refresh
      router.replace(`/auctions/${customAuctionLink}/${item.id}`, { scroll: false })
    }
  }, [customAuctionLink, item, router, searchParams, session])

  return (
    <main id="main-content" className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Modals */}
      <AuctionBidModal auctionItem={item} />

      {/* Fixed Footer Nav */}
      <FixedFooterNav
        auctionItems={auctionItems}
        customAuctionLink={customAuctionLink}
        isAuthed={isAuthed}
        isFixed={isFixed}
        item={item}
      />

      {/* ── Sticky bar ── */}
      <StickyBar
        customAuctionLink={customAuctionLink}
        days={days}
        done={done}
        hours={hours}
        isActive={isActive}
        isEnded={isEnded}
        item={item}
        minutes={minutes}
        seconds={seconds}
      />

      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 pt-8 pb-14 sm:pb-32 sm:pt-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          {/* ══ LEFT — Photos ══ */}
          <motion.div
            ref={headerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <AuctionItemPhotoGallery photos={item?.photos} name={item?.name} />
          </motion.div>

          {/* ══ RIGHT — Info + Bid ══ */}
          <div className="space-y-5">
            {/* Title block */}
            <TitleBlock
              headerInView={headerInView}
              isActive={isActive}
              isFixed={isFixed}
              isSold={isSold}
              item={item}
            />

            {/* Price block */}
            <PriceBlock
              customAuctionLink={customAuctionLink}
              headerInView={headerInView}
              isActive={isActive}
              isAuthed={isAuthed}
              isEnded={isEnded}
              isFixed={isFixed}
              isSold={isSold}
              item={item}
              topBid={topBid}
            />
            {/* Countdown */}
            {isActive && !done && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="border border-border-light dark:border-border-dark p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock
                    size={11}
                    className="text-muted-light dark:text-muted-dark"
                    aria-hidden="true"
                  />
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                    Auction Closes In
                  </span>
                </div>
                <div
                  className="flex items-end gap-5"
                  aria-label={`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds remaining`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {days > 0 && <CountUnit value={days} label="days" size="lg" />}
                  <CountUnit value={hours} label="hrs" size="lg" />
                  <CountUnit value={minutes} label="min" size="lg" />
                  <CountUnit value={seconds} label="sec" size="lg" />
                </div>
              </motion.div>
            )}

            {/* Item details */}
            <ItemDetails headerInView={headerInView} isFixed={isFixed} item={item} />
          </div>
        </div>

        {/* ══ BID HISTORY ══ */}
        {item?.bids.length > 0 && <BidHistory item={item} topBid={topBid} />}

        {/* Empty bid state */}
        {item?.bids.length === 0 && !isFixed && (
          <div className="mt-12 border border-border-light dark:border-border-dark py-16 flex flex-col items-center gap-4 text-center px-6">
            <div className="relative w-12 h-12 border border-border-light dark:border-border-dark flex items-center justify-center">
              <Gavel
                size={18}
                className="text-muted-light dark:text-muted-dark"
                aria-hidden="true"
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary-light dark:bg-primary-dark"
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="font-quicksand font-black text-base text-text-light dark:text-text-dark mb-1">
                No bids yet
              </p>
              <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                Be the first to place a bid on this item?.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
