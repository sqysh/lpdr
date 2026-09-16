'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { addressSchema } from 'lib/schemas/address.schema'
import type { ActionResult } from 'types/action.types'

export const updateAddress = async (input: unknown): Promise<ActionResult<null>> => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const parsed = parseInput(addressSchema, input)
  if (parsed.ok === false) return parsed.result

  const data = parsed.data

  try {
    const existing = await prisma.address.findUnique({ where: { userId: gate.userId }, select: { id: true } })

    await prisma.address.upsert({
      where: { userId: gate.userId },
      update: data,
      create: { ...data, userId: gate.userId }
    })

    // Someone adding an address for the first time is usually about to buy something, so it is
    // worth seeing in the feed. The address itself stays out of it: the city is enough to know
    // who this is without putting a supporter's home on a screen.
    await pusherSuperuser('address-updated', {
      userId: gate.userId,
      email: gate.email ?? null,
      isFirstAddress: !existing,
      city: data.city,
      state: data.state
    }).catch((error) =>
      createLog('warn', 'Pusher superuser trigger failed', {
        event: 'address-updated',
        userId: gate.userId,
        error: getErrorMessage(error)
      })
    )

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update address', {
      location: ['updateAddress.ts'],
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to update address. Please try again.', data: null }
  }
}
