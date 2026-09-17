'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'

export const updateUserName = async ({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  if (!firstName.trim() || !lastName.trim()) {
    return { success: false, error: 'First and last name are required', data: null }
  }

  try {
    const user = await prisma.user.update({
      where: { id: gate.userId },
      data: { firstName: firstName.trim(), lastName: lastName.trim() },
      select: { id: true, firstName: true, lastName: true, email: true }
    })

    // The name is already saved, so a feed failure is logged instead of surfacing as a failed update
    await pusherSuperuser('user-name-updated', {
      userId: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    }).catch((error) =>
      createLog('error', 'Failed to push user-name-updated to super feed', { userId: user.id, error: getErrorMessage(error) })
    )

    return { success: true, data: user, error: null }
  } catch (error) {
    await createLog('error', 'Failed to update user name', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to update name. Please try again.', data: null }
  }
}
