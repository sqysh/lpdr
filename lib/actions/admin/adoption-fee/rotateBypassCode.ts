'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'

function generateBypassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+'
  const random = (len: number) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

  return `DOXIE-${random(2).toUpperCase()}${Math.floor(Math.random() * 10)}${random(5)}`
}

export async function rotateBypassCodeCore() {
  const bypassCode = generateBypassCode()
  const existing = await prisma.adoptionApplicationBypassCode.findFirst()

  await prisma.adoptionApplicationBypassCode.upsert({
    where: { id: existing?.id ?? '' },
    update: { bypassCode, nextRotationAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    create: { bypassCode, nextRotationAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
  })

  return { bypassCode, wasFirstRun: !existing }
}

export async function rotateBypassCode() {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const result = await rotateBypassCodeCore()

    await createLog('info', 'Bypass code rotated manually', {
      wasFirstRun: result.wasFirstRun,
      rotatedBy: gate.userId
    })

    return { success: true, data: result, error: null }
  } catch (error) {
    await createLog('error', 'Failed to manually rotate bypass code', {
      error: getErrorMessage(error),
      rotatedBy: gate.userId
    })
    return { success: false, error: 'Failed to rotate bypass code. Please try again.', data: null }
  }
}
