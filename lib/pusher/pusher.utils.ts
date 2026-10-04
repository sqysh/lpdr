import { pusher } from 'lib/pusher/pusher'
import { SUPER_USER_CHANNEL } from './pusher.constants'

// Public and per-user channel events copied to the super feed. Only these two: every other event already
// sends its own, more detailed pusherSuperuser event, and copying it too showed every bid and order twice
const MIRRORED_EVENTS = new Set(['auction-started', 'auction-ended'])

export async function pusherTrigger(channel: string, event: string, data: Record<string, unknown>) {
  const mirror = channel !== SUPER_USER_CHANNEL && MIRRORED_EVENTS.has(event)

  await Promise.all([
    pusher.trigger(channel, event, data),
    mirror ? pusher.trigger(SUPER_USER_CHANNEL, event, { ...data, _channel: channel, _ts: new Date().toISOString() }) : Promise.resolve()
  ])
}

export async function pusherSuperuser(event: string, data: Record<string, unknown>) {
  await pusherTrigger(SUPER_USER_CHANNEL, event, {
    ...data,
    _ts: new Date().toISOString()
  })
}
