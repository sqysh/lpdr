'use server'

import prisma from 'prisma/client'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireAccess } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { serialize } from 'lib/utils/serializers.utils'

export async function getUserById(id: string) {
  const gate = await requireAccess('PEOPLE')
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

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
        paymentMethods: true,
        adminAreas: true
      }
    })

    if (!user) {
      return { success: false, error: 'User not found', data: null }
    }

    return { success: true, error: null, data: serialize(user) }
  } catch (error) {
    await createLog('error', 'Failed to get user by id', {
      userId: id,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to load user. Please try again.', data: null }
  }
}
