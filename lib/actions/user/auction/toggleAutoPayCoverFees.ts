'use server'

import prisma from 'prisma/client'
import { revalidatePath } from 'next/cache'
import { AuthFailure, requireAuth } from '../../auth/requireAuth'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'

export async function toggleAutoPayCoverFees() {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const user = await prisma.user.findUnique({
      where: { id: gate.userId },
      select: { autoPayCoverFees: true }
    })

    if (!user) return { success: false, error: 'User not found' }

    await prisma.user.update({
      where: { id: gate.userId },
      data: { autoPayCoverFees: !user.autoPayCoverFees }
    })

    revalidatePath('/my-pack')
    return { success: true, autoPayCoverFees: !user.autoPayCoverFees }
  } catch (error) {
    await createLog('error', 'Failed to toggle auto-pay cover fees', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to update setting' }
  }
}
