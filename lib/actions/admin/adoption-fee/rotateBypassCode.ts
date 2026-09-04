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

export async function rotateBypassCodeCore() {
  const bypassCode = generateBypassCode()
  const nextRotationAt = new Date(Date.now() + ROTATION_INTERVAL_MS)

  const existing = await prisma.adoptionApplicationBypassCode.findFirst({ select: { id: true } })

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

  return { bypassCode, wasFirstRun: !existing }
}

export async function rotateBypassCode(): Promise<ActionResult<{ bypassCode: string; wasFirstRun: boolean }>> {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const result = await rotateBypassCodeCore()

    await createLog('info', 'Bypass code rotated manually', {
      wasFirstRun: result.wasFirstRun,
      rotatedBy: gate.userId
    })

    return { success: true, data: result }
  } catch (error) {
    await createLog('error', 'Failed to manually rotate bypass code', {
      error: getErrorMessage(error),
      rotatedBy: gate.userId
    })
    return { success: false, data: null, error: 'Failed to rotate bypass code. Please try again.' }
  }
}
