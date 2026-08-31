import { getAuctionItemById } from 'lib/actions/admin/auction/getAuctionItemById'
import { getUserAddress } from 'lib/actions/my-pack/getUserAddress'
import { getUserName } from 'lib/actions/my-pack/getUserName'
import { IAuctionItem } from 'types/_auction-item'
import PublicAuctionInstantBuyClient from './PublicAuctionInstantBuyClient'
import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'
import { auth } from 'lib/auth'

export const dynamic = 'force-dynamic'

export default async function PublicAuctionInstantBuyPage({
  params
}: {
  params: Promise<{ auctionItemId: string }>
}) {
  const { auctionItemId } = await params
  const session = await auth()
  const isAuthed = !!session?.user?.id

  const [itemResult, cardsResult, userNameResult, userAddressResult] = await Promise.all([
    getAuctionItemById(auctionItemId).catch(() => ({ auctionItem: null })),
    isAuthed
      ? getSavedPaymentMethods().catch(() => ({ success: false, data: [] }))
      : Promise.resolve({ success: true, data: [] }),
    isAuthed
      ? getUserName().catch(() => ({ success: false, data: null }))
      : Promise.resolve({ success: true, data: null }),
    isAuthed
      ? getUserAddress().catch(() => ({ success: false, data: null }))
      : Promise.resolve({ success: true, data: null })
  ])

  return (
    <PublicAuctionInstantBuyClient
      auctionItem={itemResult.auctionItem as unknown as IAuctionItem}
      savedCards={cardsResult.success ? (cardsResult.data ?? []) : []}
      isAuthed={isAuthed}
      userEmail={session.user.email}
      userName={userNameResult.data}
      userAddress={userAddressResult.data}
    />
  )
}
