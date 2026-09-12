'use server'

import { randomInt } from 'crypto'
import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireSuper } from 'lib/auth/guards'
import type { ActionResult } from 'types/action.types'

// No 0/O/1/I/l — they're the ones people mistype when reading a code aloud
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const ROTATION_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000

function generateBypassCode(): string {
  const random = (len: number) => Array.from({ length: len }, () => CHARS[randomInt(CHARS.length)]).join('')

  return `DOXIE-${random(8)}`
}

/**
 * Cron cannot express a true 14-day interval, so it runs daily and this decides
 * whether the code is actually due. `force` is for a manual rotation, which
 * should happen regardless and resets the clock from now.
 */
export async function rotateBypassCodeCore({ force = false }: { force?: boolean } = {}) {
  const existing = await prisma.adoptionApplicationBypassCode.findFirst({
    select: { id: true, nextRotationAt: true }
  })

  if (!force && existing?.nextRotationAt && existing.nextRotationAt > new Date()) {
    return { rotated: false as const, nextRotationAt: existing.nextRotationAt }
  }

  const bypassCode = generateBypassCode()
  const nextRotationAt = new Date(Date.now() + ROTATION_INTERVAL_MS)

  if (existing) {
    await prisma.adoptionApplicationBypassCode.update({
      where: { id: existing.id },
      data: { bypassCode, nextRotationAt }
    })
  } else {
    await prisma.adoptionApplicationBypassCode.create({
      data: { bypassCode, nextRotationAt }
    })
  }

  return { rotated: true as const, bypassCode, nextRotationAt, wasFirstRun: !existing }
}

export async function rotateBypassCode(): Promise<ActionResult<{ bypassCode: string; nextRotationAt: Date }>> {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const result = await rotateBypassCodeCore({ force: true })

    if (!result.rotated) {
      return { success: false, data: null, error: 'Failed to rotate bypass code. Please try again.' }
    }

    await createLog('info', 'Bypass code rotated manually', {
      location: ['rotateBypassCode.ts'],
      wasFirstRun: result.wasFirstRun,
      rotatedBy: gate.userId
    })

    return { success: true, data: { bypassCode: result.bypassCode, nextRotationAt: result.nextRotationAt } }
  } catch (error) {
    await createLog('error', 'Failed to manually rotate bypass code', {
      location: ['rotateBypassCode.ts'],
      error: getErrorMessage(error),
      rotatedBy: gate.userId
    })

    return { success: false, data: null, error: 'Failed to rotate bypass code. Please try again.' }
  }
}
