import { getAuctionWinningBidderById } from 'lib/actions/user/auction/getAuctionWinningBidderById'
import AuctionWinnerPaymentClient from './AuctionWinnerPaymentClient'
import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'
import { auth } from 'lib/auth'
import { redirect } from 'next/navigation'
import { WinnerPaymentNotice } from './_components/AuctionWinnerPaymentNotice'

export default async function AuctionWinnerPaymentPage({ params }: { params: Promise<{ auctionWinningBidderId: string }> }) {
  const { auctionWinningBidderId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/auctions/winner/${auctionWinningBidderId}`)
  }

  const [result, paymentMethodsResult] = await Promise.all([
    getAuctionWinningBidderById(auctionWinningBidderId),
    getSavedPaymentMethods().catch(() => ({ success: false, data: [] }))
  ])

  // The client assumes it has a winner to bill. Everything else is answered here, so a link
  // opened on the wrong account is a page that explains itself rather than a crash.
  if (!result.data) {
    return <WinnerPaymentNotice code={result.code} belongsTo={result.meta?.belongsTo} winningBidderId={auctionWinningBidderId} />
  }

  return (
    <AuctionWinnerPaymentClient
      winningBidder={result.data}
      savedCards={paymentMethodsResult.data ?? []}
      userEmail={session.user.email ?? null}
      userId={session.user.id}
    />
  )
}
