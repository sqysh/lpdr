'use server'

import prisma from 'prisma/client'
import { getErrorMessage } from 'app/utils/_error.utils'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { createLog } from '../../log/createLog'

export async function getUserById(id: string) {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        image: true,
        phone: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        lastGeoCity: true,
        lastGeoRegion: true,
        lastGeoCountry: true,
        hasMigrated: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            type: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            shippingStatus: true,
            isRecurring: true,
            source: true,
            items: {
              select: {
                itemName: true,
                quantity: true,
                price: true,
                subtotal: true,
                itemImage: true
              }
            }
          }
        },
        paymentMethods: true
      }
    })

    if (!user) {
      return { success: false, error: 'User not found', data: null }
    }

    return {
      success: true,
      error: null,
      data: {
        ...user,
        emailVerified: user.emailVerified?.toISOString() ?? null,
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
        orders: user.orders.map((o) => ({
          ...o,
          totalAmount: Number(o.totalAmount),
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((i) => ({
            ...i,
            price: Number(i.price),
            subtotal: Number(i.subtotal)
          }))
        }))
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to get user by id', {
      userId: id,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to load user. Please try again.', data: null }
  }
}
