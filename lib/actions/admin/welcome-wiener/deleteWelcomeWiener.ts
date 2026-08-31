'use server'

import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { createLog } from '../../log/createLog'

type ActionResult<T = undefined> = {
  success: boolean
  data?: T | null
  error?: string
}

export async function deleteWelcomeWiener(id: string): Promise<ActionResult> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error, data: null }

  if (!id) return { success: false, error: 'Missing id', data: null }

  try {
    await prisma.welcomeWiener.delete({ where: { id } })

    await createLog('info', 'Welcome Wiener deleted', { id, by: gate.userId })

    revalidatePath('/', 'layout')

    return { success: true, data: null }
  } catch (err) {
    await createLog('error', 'deleteWelcomeWiener failed', { id, error: String(err) })
    return { success: false, error: 'Failed to delete', data: null }
  }
}
