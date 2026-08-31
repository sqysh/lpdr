import getActiveAuctionForSuperuser from 'lib/actions/super-user/getActiveAuctionForSuperUser'
import AdminAuctionLiveClient from './AdminAuctionLiveClient'

export default async function AdminAuctionLivePage() {
  const result = await getActiveAuctionForSuperuser()
  return <AdminAuctionLiveClient auction={result?.data} />
}
