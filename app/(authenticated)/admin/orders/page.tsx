import prisma from 'prisma/client'
import { AdminOrdersClient } from './AdminOrdersClient'
import { serialize } from 'lib/utils/serializers.utils'
import { orderListArgs } from 'types/order.types'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    where: { source: 'SITE' },
    orderBy: { createdAt: 'desc' },
    ...orderListArgs
  })

  return <AdminOrdersClient orders={serialize(orders)} />
}
