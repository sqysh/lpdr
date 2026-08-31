import { NextResponse } from 'next/server'
import prisma from 'prisma/client'
import { createLog } from 'app/lib/actions/log/createLog'

export const GET = async (request: Request) => {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const deleted = await prisma.paymentAttempt.deleteMany({
      where: { createdAt: { lt: cutoff } }
    })

    await createLog('info', '[CRON] cleanup-payment-attempts', {
      cronName: 'cleanup-payment-attempts',
      status: deleted.count === 0 ? 'skipped' : 'success',
      durationMs: Date.now() - start,
      detail: `${deleted.count} attempt(s) deleted`
    })

    return NextResponse.json({ success: true, deletedCount: deleted.count })
  } catch (error) {
    await createLog('error', '[CRON] cleanup-payment-attempts', {
      cronName: 'cleanup-payment-attempts',
      status: 'error',
      durationMs: Date.now() - start,
      detail: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json({ success: false, error: 'Cron job failed' }, { status: 500 })
  }
}
