'use server'

import prisma from 'prisma/client'
import { UpdateAdoptionFeeInputs } from 'types/_adoption-fee'
import { cookies } from 'next/headers'
import { createLog } from '../../log/createLog'
import { AuthFailure, requireAuth } from '../../auth/requireAuth'

export const updateAdoptionFee = async (data: UpdateAdoptionFeeInputs) => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.adoptionFee.update({
      where: { id: data.adoptionFeeId, userId: gate.userId },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        state: data.state,
        expiresAt
      }
    })

    const cookieStore = await cookies()
    cookieStore.set('lpdr_active_adoption_fee', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to update adoption fee', {
      id: data.adoptionFeeId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { success: false, error: 'Failed to update adoption fee. Please try again.' }
  }
}
