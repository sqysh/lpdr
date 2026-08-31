import { NextResponse } from 'next/server'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { createLog } from 'lib/actions/log/createLog'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.TEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await pusherSuperuser('test-ping', {
      message: 'Pusher is working',
      timestamp: new Date().toISOString()
    })

    await createLog('info', 'Pusher test ping sent', {
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({ success: true, message: 'Pusher test ping sent' })
  } catch (error) {
    await createLog('error', 'Pusher test ping failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
