import 'client-only'
import Pusher from 'pusher-js'

// Cached on globalThis for the same reason as prisma: HMR re-evaluates this module, and each run would leave a socket behind
const globalForPusher = globalThis as unknown as { pusherClient?: Pusher | null }

// Created on first use in the browser. A module-level instance also ran during server rendering of client
// components, where pusher-js opens a real socket that never subscribes and stays open for the life of the function
export function getPusherClient() {
  if (typeof window === 'undefined') {
    throw new Error('getPusherClient is browser only; call it inside an effect or event handler')
  }

  if (!globalForPusher.pusherClient) {
    globalForPusher.pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
      // ...keep any other options from the current file
    })
  }

  return globalForPusher.pusherClient
}

export function releasePusherClient() {
  const client = globalForPusher.pusherClient

  // Only drop the socket once nothing is subscribed, so two components on one page don't cut each other off
  if (client && client.allChannels().length === 0) {
    client.disconnect()
    globalForPusher.pusherClient = null
  }
}
