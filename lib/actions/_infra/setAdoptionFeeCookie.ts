'use server'

import prisma from 'prisma/client'
import { cookies } from 'next/headers'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'

export const setAdoptionFeeCookie = async (adoptionFeeId: string) => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const fee = await prisma.adoptionFee.findFirst({
      where: { id: adoptionFeeId, userId: gate.userId },
      select: { expiresAt: true }
    })

    if (!fee?.expiresAt) return { success: false, error: 'Adoption fee not found' }

    const cookieStore = await cookies()
    cookieStore.set('lpdr_active_adoption_fee', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor((fee.expiresAt.getTime() - Date.now()) / 1000)
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to set adoption fee cookie', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { success: false, error: 'Failed to set adoption fee cookie.' }
  }
}
