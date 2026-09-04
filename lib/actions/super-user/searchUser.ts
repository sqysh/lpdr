'use server'

import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../log/createLog'

export async function searchUser(email: string) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const normalizedEmail = email.toLowerCase().trim()

  if (!normalizedEmail) {
    return { success: false, error: 'Enter an email address', data: null }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true
      }
    })

    if (!user) return { success: false, error: 'No user found with that email', data: null }

    return {
      success: true,
      error: null,
      data: {
        id: user.id,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        status: user.status
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to search user', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to search user', data: null }
  }
}
