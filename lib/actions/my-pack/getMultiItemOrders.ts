'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'

export const getMultiItemOrders = async () => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: gate.userId,
        status: 'CONFIRMED',
        type: 'PURCHASE'
      },
      include: {
        items: true,
        user: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      error: null,
      data: orders.map((o) => ({
        id: o.id,
        type: o.type,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt.toISOString(),
        status: o.status,
        shippingStatus: o.shippingStatus ?? null,
        customerName: [o.user?.firstName, o.user?.lastName].filter(Boolean).join(' ') || null,
        items: o.items.map((item) => ({
          id: item.id,
          name: item.itemName ?? 'Item',
          image: item.itemImage ?? null,
          iconKey: item.iconKey ?? null,
          itemType: item.itemType ?? null,
          price: Number(item.price),
          quantity: item.quantity ?? 1,
          isPhysical: item.isPhysical
        })),
        shippingAddress: o.addressLine1
          ? {
              addressLine1: o.addressLine1,
              addressLine2: o.addressLine2 ?? null,
              city: o.city ?? null,
              state: o.state ?? null,
              zipPostalCode: o.zipPostalCode ?? null
            }
          : null
      }))
    }
  } catch (error) {
    await createLog('error', 'Failed to get multi-item orders', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to load your orders. Please try again.', data: null }
  }
}
