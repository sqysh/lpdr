// scripts/pusher-channels.ts
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!
})

const res = await pusher.get({ path: '/channels', params: { info: 'subscription_count' } })
console.log(JSON.stringify(await res.json(), null, 2))
