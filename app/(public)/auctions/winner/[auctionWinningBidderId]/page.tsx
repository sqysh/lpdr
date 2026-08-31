import { getAuctionWinningBidderById } from 'lib/actions/user/auction/getAuctionWinningBidderById'
import AuctionWinnerPaymentClient from './AuctionWinnerPaymentClient'
import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'
import { auth } from 'lib/auth'
import { redirect } from 'next/navigation'

export default async function AuctionWinnerPaymentPage({
  params
}: {
  params: Promise<{ auctionWinningBidderId: string }>
}) {
  const { auctionWinningBidderId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/auctions/winner/${auctionWinningBidderId}`)
  }

  const [result, paymentMethodsResult] = await Promise.all([
    getAuctionWinningBidderById(auctionWinningBidderId).catch(() => ({ data: null })),
    getSavedPaymentMethods().catch(() => ({ success: false, data: [] }))
  ])

  return (
    <AuctionWinnerPaymentClient
      winningBidder={result?.data}
      savedCards={paymentMethodsResult.data}
    />
  )
}
