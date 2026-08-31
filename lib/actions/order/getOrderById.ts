'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'

export const getOrderById = async (id: string) => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        totalAmount: true,
        feesCovered: true,
        coverFees: true,
        isRecurring: true,
        recurringFrequency: true,
        customerEmail: true,
        customerName: true,
        paidAt: true,
        createdAt: true,
        notes: true,
        isPhysical: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        zipPostalCode: true,
        tierName: true,
        userId: true,
        items: {
          select: {
            id: true,
            itemName: true,
            itemImage: true,
            quantity: true,
            price: true,
            subtotal: true,
            totalPrice: true,
            isPhysical: true,
            iconKey: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!order) return { success: false, error: 'Order not found', data: null }

    // Only the order owner or an admin can view it
    const isOwner = order.userId === gate.userId
    const isAdmin = gate.role === 'ADMIN' || gate.role === 'SUPER_USER'
    if (!isOwner && !isAdmin) {
      return { success: false, error: 'Unauthorized', data: null }
    }

    return {
      success: true,
      error: null,
      data: {
        ...order,
        totalAmount: Number(order.totalAmount),
        feesCovered: Number(order.feesCovered),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
          subtotal: item.subtotal ? Number(item.subtotal) : null,
          totalPrice: item.totalPrice ? Number(item.totalPrice) : null
        }))
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to fetch order', {
      orderId: id,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to fetch order', data: null }
  }
}
