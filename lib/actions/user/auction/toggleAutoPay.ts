'use server'

import prisma from 'prisma/client'
import { revalidatePath } from 'next/cache'
import { getErrorMessage } from 'app/utils/_error.utils'
import { AuthFailure, requireAuth } from '../../auth/requireAuth'
import { createLog } from '../../log/createLog'

export async function toggleAutoPay() {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const user = await prisma.user.findUnique({
      where: { id: gate.userId },
      select: { autoPay: true }
    })

    if (!user) return { success: false, error: 'User not found' }

    await prisma.user.update({
      where: { id: gate.userId },
      data: { autoPay: !user.autoPay }
    })

    revalidatePath('/my-pack')
    return { success: true, autoPay: !user.autoPay }
  } catch (error) {
    await createLog('error', 'Failed to toggle auto-pay', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to update setting' }
  }
}
