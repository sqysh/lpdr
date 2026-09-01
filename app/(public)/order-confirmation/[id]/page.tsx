import OrderConfirmationClient from 'app/(public)/order-confirmation/[id]/OrderConfirmationClient'
import { getOrderById } from 'lib/actions/admin/order/getOrderById'

export default async function OrderConfirmationPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getOrderById(id)
  return <OrderConfirmationClient order={result?.data} />
}
