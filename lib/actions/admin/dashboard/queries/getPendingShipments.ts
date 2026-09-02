import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'

export async function getPendingShipments() {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const pendingShipmentsRaw = await prisma.order.findMany({
    where: { status: 'CONFIRMED', source: 'SITE', shippingStatus: 'PENDING_FULFILLMENT' },
    include: {
      items: {
        where: { isPhysical: true },
        select: { itemName: true, quantity: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return {
    success: true,
    data: pendingShipmentsRaw.map((o) => ({
      id: o.id,
      name: o.customerName || o.customerEmail,
      items:
        o.items
          .map(
            (i) => `${i.itemName ?? 'Item'}${i.quantity && i.quantity > 1 ? ` ×${i.quantity}` : ''}`
          )
          .join(', ') || 'Physical item',
      total: Number(o.totalAmount),
      createdAt: o.createdAt.toISOString(),
      address:
        [o.addressLine1, o.addressLine2, o.city, o.state, o.zipPostalCode, o.country]
          .filter(Boolean)
          .join(', ') || 'No address on file'
    })),
    error: null
  }
}
